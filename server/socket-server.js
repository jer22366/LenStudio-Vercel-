import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 創建資料庫連接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'lenstudio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 測試資料庫連接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testConnection();

// 儲存用戶連接信息
const connectedUsers = new Map(); // 用戶 ID -> socket ID
const adminSockets = new Map(); // 管理員 ID -> socket ID
const userChats = new Map(); // 用戶 ID -> 消息歷史記錄
// 新增追踪管理員正在查看的用戶對應表
const adminViewingUsers = new Map(); // 管理員 ID -> 正在查看的用戶 ID
const adminLeaveTimes = new Map(); // 用戶 ID -> 管理員離開時間

// 驗證用戶身份
const authenticateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    console.error("Token驗證失敗:", error.message);
    return null;
  }
};

io.on('connection', (socket) => {
  console.log('用戶連接:', socket.id);

  // 用戶認證
  socket.on('authenticate', async (data) => {
    console.log('收到認證數據:', data); // 調試日誌

    // 安全地獲取認證數據，確保不會因為缺少屬性而崩潰
    const auth = data?.auth || data || {};
    const token = auth.token || 'anonymous';
    const isAdmin = auth.isAdmin || false;
    const userId = auth.userId || `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userName = auth.userName || '訪客';

    console.log(`認證信息: token=${token}, isAdmin=${isAdmin}, userId=${userId}, userName=${userName}`);

    // 驗證 token
    const user = authenticateToken(token);

    // 從資料庫獲取最新用戶資訊
    const [userRows] = await pool.query(
      `SELECT 
        id,
        IF(TRIM(nickname) = '', name, nickname) AS display_name,
        COALESCE(head, '/images/chatRoom/user1.jpg') AS avatar
      FROM users 
      WHERE id = ?`,
      [user?.id || userId]
    );

    const userInfo = userRows[0] || {};

    // 使用資料庫資訊設置用戶屬性
    socket.userId = user?.id || userId;
    socket.userName = userInfo.display_name || user?.name || userName;
    socket.userAvatar = userInfo.avatar || '/images/chatRoom/user1.jpg';
    socket.isAdmin = isAdmin || (user?.level === 2);

    console.log(`用戶已認證: ID=${socket.userId}, Name=${socket.userName}, isAdmin=${socket.isAdmin}`);

    // 認證成功事件
    socket.emit('auth_success', {
      userId: socket.userId,
      userName: socket.userName,
      isAdmin: socket.isAdmin // 確保返回 isAdmin 狀態
    });

    if (socket.isAdmin) {
      // 管理員登入處理...
      adminSockets.set(socket.userId, socket.id);
      console.log(`管理員 ${socket.userId} (${socket.userName}) 已連接`);

      // 新增：確認是否有之前選擇的用戶
      socket.on('reconnect_selected_user', (selectedUserId) => {
        if (selectedUserId) {
          // 重新設置管理員正在查看的用戶
          adminViewingUsers.set(socket.userId, selectedUserId);
          console.log(`管理員 ${socket.userId} 重新連接後繼續查看用戶 ${selectedUserId}`);

          // 標記該用戶的所有未讀消息為已讀
          const chatHistory = userChats.get(selectedUserId) || [];
          let updated = false;

          for (const msg of chatHistory) {
            if (!msg.read && msg.sender === 'user') {
              msg.read = true;
              updated = true;
            }
          }

          if (updated) {
            const readMessageIds = chatHistory
              .filter(msg => msg.read && msg.sender === 'user')
              .map(msg => msg.id);

            // 通知用戶端更新已讀狀態
            const userSocketId = connectedUsers.get(selectedUserId);
            if (userSocketId) {
              io.to(userSocketId).emit('messages_read', { messageIds: readMessageIds });
            }
          }
        }
      });

      // 向管理員發送當前所有活躍的用戶清單
      const activeUsers = [];
      for (const [userId, messages] of userChats.entries()) {
        // 只處理有消息記錄的用戶
        if (messages && messages.length > 0) {
          try {
            // 從資料庫獲取用戶資訊
            const [userRows] = await pool.query(
              `SELECT 
                u.id,
                IF(TRIM(COALESCE(u.nickname, '')) = '', u.name, u.nickname) AS display_name,
                COALESCE(u.head, '/images/chatRoom/user1.jpg') AS avatar
              FROM users u 
              WHERE u.id = ?`,
              [userId]
            );

            if (userRows && userRows.length > 0) {
              const userInfo = userRows[0];
              const lastMessage = messages[messages.length - 1];

              activeUsers.push({
                id: userId,
                name: userInfo.display_name,
                avatar: userInfo.avatar,
                lastMessage: lastMessage?.text || '',
                lastMessageType: lastMessage?.fileType || 'text',
                mediaCount: lastMessage?.fileType ? 1 : 0,
                timestamp: lastMessage?.timestamp || new Date(),
                unreadCount: messages.filter(m => !m.read && m.sender === 'user').length,
                online: connectedUsers.has(userId)
              });
            }
          } catch (error) {
            console.error(`Error fetching user info for ${userId}:`, error);
          }
        }
      }

      // 只有當有活躍用戶時才發送
      if (activeUsers.length > 0) {
        socket.emit('active_users', activeUsers);
      }

      // 添加：發送現有消息歷史記錄
      if (userChats.size > 0) {
        for (const [userId, chatHistory] of userChats.entries()) {
          // 確保消息標記正確
          const verifiedHistory = chatHistory.map(msg => ({
            ...msg,
            // 確保 sender 標記正確 - 保持原來的 sender 值
            sender: msg.sender // 'agent' 或 'user'
          }));

          // 如果已選擇用戶，立即發送其聊天記錄
          if (socket.selectedUserId === userId) {
            socket.emit('chat_history', verifiedHistory);
          }
        }
      }

    } else {
      // 一般用戶登入處理...
      connectedUsers.set(socket.userId, socket.id);
      console.log(`用戶 ${socket.userId} (${socket.userName}) 已連接`);

      // 如果用戶之前有聊天記錄，發送給用戶
      if (userChats.has(socket.userId)) {
        socket.emit('chat_history', userChats.get(socket.userId));
      } else {
        // 初始化用戶聊天記錄
        userChats.set(socket.userId, []);
      }

      // 通知所有在線管理員有新用戶連接
      for (const [adminId, adminSocketId] of adminSockets.entries()) {
        const adminSocket = io.sockets.sockets.get(adminSocketId);
        if (adminSocket) {
          adminSocket.emit('user_connected', {
            id: socket.userId,
            name: socket.userName,
            avatar: socket.userAvatar,
            online: true,
            lastMessage: '',
            lastMessageType: 'text',
            timestamp: new Date(),
            unreadCount: 0
          });
        }
      }

      // 添加：發送用戶的消息歷史
      const chatHistory = userChats.get(socket.userId) || [];
      // 碩保消息標記正確
      const verifiedHistory = chatHistory.map(msg => ({
        ...msg,
        // 確保 sender 標記正確
        sender: msg.sender // 'agent' 或 'user'
      }));
      socket.emit('chat_history', verifiedHistory);
    }
  });

  // 用戶發送消息
  socket.on('send_message', async (data) => {
    console.log('收到消息:', data); // 調試日誌

    // 從請求中提取數據
    const { message, to } = data;

    if (!socket.userId) {
      console.log('未認證用戶嘗試發送消息');
      socket.emit('error', { message: '未認證，請先登入' });
      return;
    }

    // 檢查消息格式
    if (!message) {
      console.log('消息格式不正確:', data);
      socket.emit('error', { message: '消息格式不正確' });
      return;
    }

    // 從資料庫獲取發送者資訊
    const [userRows] = await pool.query(
      `SELECT 
        IF(TRIM(nickname) = '', name, nickname) AS display_name,
        COALESCE(head, '/images/chatRoom/user1.jpg') AS avatar
      FROM users 
      WHERE id = ?`,
      [socket.userId]
    );

    const userInfo = userRows[0] || {};

    // 修改訊息ID生成方式
    const messageObject = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // 改進唯一ID生成
      text: message.text || '',
      fileUrl: message.fileUrl || null,
      fileType: message.fileType || null,
      sender: socket.isAdmin ? 'agent' : 'user',
      senderName: userInfo.display_name,
      avatar: userInfo.avatar,
      timestamp: new Date(),
      read: false
    };

    // 使用資料庫中的最新頭像
    const userAvatar = userInfo.avatar || '/images/chatRoom/user1.jpg';

    // 更新 socket 中的頭像信息
    socket.userAvatar = userAvatar;

    // 優化用戶消息處理邏輯
    if (!socket.isAdmin) {
      // 檢查是否有管理員正在查看此用戶的聊天室
      let isBeingViewed = false;
      let viewingAdmins = []; // 添加這行來追蹤正在查看的管理員

      for (const [adminId, viewingUserId] of adminViewingUsers.entries()) {
        if (viewingUserId === socket.userId) {
          isBeingViewed = true;
          viewingAdmins.push(adminId); // 記錄正在查看的管理員
        }
      }

      // 將消息存儲到用戶聊天歷史
      if (!userChats.has(socket.userId)) {
        userChats.set(socket.userId, []);
      }
      const userChatHistory = userChats.get(socket.userId);

      // 設置消息已讀狀態
      messageObject.read = isBeingViewed;
      userChatHistory.push(messageObject);

      // 這裡是新增的關鍵代碼：如果消息被標記為已讀，立即通知用戶端
      if (isBeingViewed) {
        // 發送已讀通知給用戶
        const userSocketId = connectedUsers.get(socket.userId);
        if (userSocketId) {
          io.to(userSocketId).emit('messages_read', {
            messageIds: [messageObject.id]
          });
        }

        // 同時通知管理員更新未讀狀態（防止介面未更新）
        for (const adminId of viewingAdmins) {
          const adminSocketId = adminSockets.get(adminId);
          if (adminSocketId) {
            io.to(adminSocketId).emit('messages_read', {
              messageIds: [messageObject.id],
              userId: socket.userId
            });
          }
        }
      }

      // 構造清晰的最新消息信息
      const lastMessageInfo = {
        userId: socket.userId,
        userName: socket.userName,
        avatar: socket.userAvatar,
        timestamp: messageObject.timestamp.toISOString(), // 確保時間戳格式一致
        lastMessage: messageObject.text || '',
        lastMessageType: messageObject.fileType || 'text',
        mediaCount: messageObject.fileType ? 1 : 0,
        read: messageObject.read
      };

      // 計算未讀計數 - 必須在添加新消息後
      const unreadCount = userChatHistory.filter(m => !m.read && m.sender === 'user').length;
      console.log(`[SERVER] 用戶 ${socket.userId} 未讀消息數: ${unreadCount}`);

      // 優化事件發送邏輯 - 在 send_message 事件處理中
      for (const [adminId, adminSocketId] of adminSockets.entries()) {
        // 發送用戶更新事件
        io.to(adminSocketId).emit('update_user_last_message', {
          userId: socket.userId,
          userName: socket.userName,
          avatar: userAvatar,
          timestamp: new Date().toISOString(),
          lastMessage: messageObject.text || '',
          lastMessageType: messageObject.fileType || 'text',
          mediaCount: messageObject.fileType ? 1 : 0,
          read: messageObject.read,
          _serverTime: Date.now()
        });

        // 發送未讀計數更新
        io.to(adminSocketId).emit('update_user_unread_count', {
          userId: socket.userId,
          unreadCount: unreadCount,
          _serverTime: Date.now()
        });

        // 關鍵修改 - 只對正在查看該用戶的管理員發送聊天消息
        const viewingUserId = adminViewingUsers.get(adminId);
        console.log(`管理員 ${adminId} 正在查看用戶 ${viewingUserId}`);

        // 僅當管理員正在查看該用戶時，才發送消息內容
        if (viewingUserId === socket.userId) {
          console.log(`發送消息到管理員 ${adminId}，因為他正在查看用戶 ${socket.userId}`);
          io.to(adminSocketId).emit('receive_message', {
            ...messageObject,
            userId: socket.userId,
            _serverTime: Date.now()
          });
        } else {
          console.log(`不發送消息到管理員 ${adminId}，因為他正在查看用戶 ${viewingUserId}`);
        }
      }

      // 把這段放進來，才能在發送完消息後即時更新
      for (const [adminId, adminSocketId] of adminSockets.entries()) {
        const messageUpdateData = {
          userId: socket.userId,
          userName: socket.userName,
          avatar: socket.userAvatar,
          timestamp: new Date().toISOString(),
          lastMessage: messageObject.text || '',
          lastMessageType: messageObject.fileType || 'text',
          mediaCount: messageObject.fileType ? 1 : 0,
          read: messageObject.read,
          _serverTime: Date.now(),
          _priority: 'high'
        };
        io.to(adminSocketId).emit('update_user_last_message', messageUpdateData);
      }

      // 關鍵：當管理員正在查看該用戶時，立即通知用戶端該訊息已讀
      if (isBeingViewed) {
        // 發送已讀通知給用戶
        const userSocketId = connectedUsers.get(socket.userId);
        console.log(`用戶 ${socket.userId} 發送訊息時，管理員在線，立即標記已讀`);
        if (userSocketId) {
          io.to(userSocketId).emit('messages_read', {
            messageIds: [messageObject.id]
          });
        }

        // 同時通知管理員更新未讀狀態（防止介面未更新）
        for (const adminId of viewingAdmins) {
          const adminSocketId = adminSockets.get(adminId);
          if (adminSocketId) {
            io.to(adminSocketId).emit('messages_read', {
              messageIds: [messageObject.id],
              userId: socket.userId
            });
          }
        }
      }
    } else {
      // 管理員發送消息 - 發送給特定用戶
      if (!to) {
        console.log('管理員發送消息但未指定目標用戶');
        socket.emit('error', { message: '請指定目標用戶' });
        return;
      }

      // 查找用戶的socket
      const userSocketId = connectedUsers.get(to);
      if (userSocketId) {
        // 用戶在線，直接發送
        io.to(userSocketId).emit('receive_message', messageObject);
      }

      // 將消息存儲到用戶聊天歷史
      if (!userChats.has(to)) {
        userChats.set(to, []);
      }
      userChats.get(to).push(messageObject);

      // 發送確認給管理員
      socket.emit('message_sent', { id: messageObject.id, to });
    }
  });

  // 標記消息為已讀
  socket.on('mark_as_read', (data) => {
    const { messageIds, userId } = data;
    const currentUserId = socket.userId;

    if (!currentUserId) {
      socket.emit('error', { message: '未認證，請先登入' });
      return;
    }

    // 對應的聊天記錄
    const chatHistory = socket.isAdmin ?
      (userId ? userChats.get(userId) : null) :
      userChats.get(currentUserId);

    if (!chatHistory) return;

    // 更新已讀狀態 - 確保更新正確的訊息
    let wasUpdated = false;
    for (const message of chatHistory) {
      const shouldMark = socket.isAdmin
        ? (messageIds.includes(message.id) && !message.read && message.sender === 'user')
        : (messageIds.includes(message.id) && !message.read && message.sender === 'agent');

      if (shouldMark) {
        message.read = true;
        wasUpdated = true;
      }
    }

    // 只有在實際更新了消息時才發送通知
    if (wasUpdated) {
      if (socket.isAdmin) {
        // 管理員標記，通知相應用戶
        const userSocketId = connectedUsers.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit('messages_read', messageIds);
          // 發送完整聊天紀錄給 user
          io.to(userSocketId).emit('chat_history', chatHistory);
        }

        // 通知所有管理員更新未讀計數
        const unreadCount = chatHistory.filter(m => !m.read && m.sender === 'user').length;
        for (const adminSocketId of adminSockets.values()) {
          io.to(adminSocketId).emit('update_user_unread_count', {
            userId,
            unreadCount
          });
        }

        // **新加入**：通知當前 admin 自己更新已讀及聊天紀錄
        socket.emit('messages_read', messageIds);
        socket.emit('chat_history', chatHistory);

      } else {
        // 用戶標記，通知所有管理員
        for (const [adminId, adminSocketId] of adminSockets.entries()) {
          io.to(adminSocketId).emit('messages_read', {
            messageIds,
            userId: currentUserId
          });
          io.to(adminSocketId).emit('update_user_unread_count', {
            userId: currentUserId,
            unreadCount: chatHistory.filter(m => !m.read && m.sender === 'user').length
          });
          io.to(adminSocketId).emit('chat_history', chatHistory);
        }

        // 通知當前用戶更新已讀及完整聊天紀錄
        socket.emit('messages_read', messageIds);
        socket.emit('chat_history', chatHistory);
      }
    }
  });

  // 當用戶開始輸入
  socket.on('typing_start', () => {
    const userId = socket.userId;
    if (!userId) return;

    if (socket.isAdmin) {
      // 管理員輸入中，通知相應用戶
      const targetUserId = socket.currentChatUser;
      if (!targetUserId) return;

      const userSocketId = connectedUsers.get(targetUserId);
      if (userSocketId) {
        io.to(userSocketId).emit('typing_start', { userId, userName: socket.userName });
      }
    } else {
      // 用戶輸入中，通知所有管理員
      for (const [adminId, adminSocketId] of adminSockets.entries()) {
        io.to(adminSocketId).emit('typing_start', {
          userId,
          userName: socket.userName
        });
      }
    }
  });

  // 用戶停止輸入
  socket.on('typing_end', () => {
    const userId = socket.userId;
    if (!userId) return;

    if (socket.isAdmin) {
      // 管理員停止輸入，通知相應用戶
      const targetUserId = socket.currentChatUser;
      if (!targetUserId) return;

      const userSocketId = connectedUsers.get(targetUserId);
      if (userSocketId) {
        io.to(userSocketId).emit('typing_end', { userId });
      }
    } else {
      // 用戶停止輸入，通知所有管理員
      for (const [adminId, adminSocketId] of adminSockets.entries()) {
        io.to(adminSocketId).emit('typing_end', { userId });
      }
    }
  });

  // 管理員選擇聊天的用戶
  socket.on('select_user', (userId) => {
    if (!socket.isAdmin) return;

    socket.currentChatUser = userId;
    adminViewingUsers.set(socket.userId, userId);

    const chatHistory = userChats.get(userId) || [];

    // 實際標記未讀為已讀
    let updated = false;
    for (const msg of chatHistory) {
      if (!msg.read && msg.sender === 'user') {
        msg.read = true;
        updated = true;
      }
    }

    if (updated) {
      // 取得已讀的 messageIds
      const readMessageIds = chatHistory
        .filter(msg => msg.read && msg.sender === 'user')
        .map(msg => msg.id)

      // 發送標準格式的 payload (物件包含 messageIds)
      const userSocketId = connectedUsers.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit('messages_read', { messageIds: readMessageIds });

        // 同時發送更新後的聊天記錄
        io.to(userSocketId).emit('chat_history', chatHistory);
      }
    }

    socket.emit('chat_history', chatHistory);
  });

  // 管理員離開特定用戶聊天室
  socket.on('leave_user_chat', (userId) => {
    if (!socket.isAdmin) return;

    console.log(`管理員 ${socket.userId} 離開用戶 ${userId} 的聊天室`);

    // 在這裡記錄管理員離開時間，後續新訊息將被標記為未讀
    adminLeaveTimes.set(userId, Date.now());

    // 從當前查看映射中移除
    adminViewingUsers.delete(socket.userId);
  });

  // 用戶斷開連接
  socket.on('disconnect', () => {
    const userId = socket.userId;

    if (socket.isAdmin) {
      // 管理員斷開連接
      adminViewingUsers.delete(socket.userId);
      adminSockets.delete(userId);
      console.log(`管理員 ${userId} 已斷開連接，清除查看狀態`);
    } else if (userId) {
      // 普通用戶斷開連接
      connectedUsers.delete(userId);
      console.log(`用戶 ${userId} 已斷開連接`);

      // 通知所有管理員用戶離線
      for (const [adminId, adminSocketId] of adminSockets.entries()) {
        io.to(adminSocketId).emit('user_disconnected', userId);
      }
    }
  });


  // 在 authenticate 事件中:

  // 當用戶連接時發送給管理員
  socket.on('authenticate', async (data) => {
    // ...existing code...

    if (socket.isAdmin) {
      // 管理員登入時發送用戶列表
      const activeUsers = [];
      for (const [userId, messages] of userChats.entries()) {
        // 從資料庫獲取用戶資訊
        const [userRows] = await pool.query(
          `SELECT 
            u.id,
            IF(TRIM(u.nickname) = '', u.name, u.nickname) AS display_name,
            COALESCE(u.head, '/images/chatRoom/user1.jpg') AS avatar
          FROM users u 
          WHERE u.id = ?`,
          [userId]
        );

        const userInfo = userRows[0] || {};
        const lastMessage = messages[messages.length - 1];

        activeUsers.push({
          id: userId,
          name: userInfo.display_name, // 使用 nickname 或 name 
          avatar: userInfo.avatar, // 使用用戶的頭像
          lastMessage: lastMessage?.text || '',
          lastMessageType: lastMessage?.fileType || 'text',
          timestamp: lastMessage?.timestamp || new Date(),
          unreadCount: messages.filter(m => !m.read && m.sender === 'user').length
        });
      }

      socket.emit('active_users', activeUsers);
    }
  });


  // 增加調試輸出，確認 adminViewingUsers 狀態
  socket.on('send_message', async (data) => {
    // 在接收用戶訊息時，印出所有管理員正在查看的狀態
    if (!socket.isAdmin) {
      console.log(`用戶 ${socket.userId} 發送訊息，檢查管理員查看狀態：`);
      for (const [adminId, viewingUserId] of adminViewingUsers.entries()) {
        console.log(`管理員 ${adminId} 正在查看 ${viewingUserId}`);
      }
    }

  });
});


const PORT = process.env.SOCKET_PORT || 8001;
server.listen(PORT, () => {
  console.log(`Socket.io 伺服器運行在端口 ${PORT}`);
});

export default server;