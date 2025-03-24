"use client"

import React, { useCallback } from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "react-bootstrap"
import { X, Check, CheckAll, ChevronDown } from "react-bootstrap-icons"
import { CSSTransition } from "react-transition-group"
import styles from "./index.module.scss"
import EmojiPicker, { SkinTones } from 'emoji-picker-react';
import emojiRegex from 'emoji-regex';
import { Squeeze } from 'hamburger-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useSocket } from '../context/socketContext';

// 檢查兩個日期是否是同一天
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

// 根據時間差異格式化訊息時間
const formatMessageTime = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);

  // 檢查是否同一年
  const isSameYear = now.getFullYear() === messageDate.getFullYear();

  // 檢查是否同一天
  const isSameYearAndDay = isSameYear &&
    now.getMonth() === messageDate.getMonth() &&
    now.getDate() === messageDate.getDate();

  // 格式化時間
  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isSameYearAndDay) {
    return timeStr;
  } else if (isSameYear) {
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${month}月${day}日 ${timeStr}`;
  } else {
    const year = messageDate.getFullYear();
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${year}年${month}月${day}日 ${timeStr}`;
  }
};

// 使用者列表：相對時間格式
const formatRelativeMessageTime = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 10) return "剛剛";
  if (diffInSeconds < 60) return `${diffInSeconds}秒前`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}分前`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}小時前`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}日前`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}周前`;
};

// 訊息視窗：絕對時間格式
const formatDateTime = (date, includeYear = true) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return includeYear
    ? `${year}-${month}-${day} ${hours}:${minutes}`
    : `${month}-${day} ${hours}:${minutes}`;
};

const formatAbsoluteMessageTime = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const oneMonthMs = 30 * 24 * 3600 * 1000;

  // 同一天僅顯示 hh:mm
  if (isSameDay(now, messageDate)) {
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // 超過 1 個月以上，顯示完整年份：yyyy-mm-dd hh:mm
  if (now - messageDate >= oneMonthMs) {
    return formatDateTime(messageDate, true);
  }

  // 超過 1 天但小於 1 個月，省略年份：mm-dd hh:mm
  return formatDateTime(messageDate, false);
};

// 格式化未讀消息數量
const formatUnreadCount = (count) => {
  if (count >= 100) {
    return '99+';
  }
  return count;
};


// 決定未讀標記的樣式類
const getUnreadBadgeClass = (count) => {
  // 當數字大於等於100或顯示為"99+"時使用藥丸型
  if (count >= 100 || String(count).length >= 3) {
    return styles.unreadBadgePill;
  }
  // 其他情況使用圓形
  return styles.unreadBadgeCircle;
};

const captureEmojiRegex = new RegExp(`(${emojiRegex().source})`, 'gu');


export default function ChatWidget() {
  // 使用 Socket 上下文
  const socketContext = useSocket();


  // 創建一個強制更新機制
  const [updateCounter, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCounter(c => c + 1), []);

  // 從 socketContext 解構所需的數據和函數
  const {
    socket,
    isConnected,
    messages: socketMessages,
    userList: contextUserList,
    selectedUser,
    error,
    sendMessage: socketSendMessage,
    markAsRead,
    selectUser: socketSelectUser,
    leaveUserChat,
    setMessages: setSocketMessages,
    setSelectedUser
  } = socketContext;

  // 使用本地狀態存儲用戶列表
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (socket && isConnected && activeUserId) {
      console.log('Socket 重新連接，恢復選擇的用戶:', activeUserId);
      socket.emit('reconnect_selected_user', activeUserId);

      // 同時也請求最新的聊天記錄
      socketSelectUser(activeUserId);
    }
  }, [socket, isConnected]);

  // 修改 useEffect 中的用戶列表更新邏輯
  useEffect(() => {
    if (!contextUserList || contextUserList.length === 0) return;

    console.log('【用戶列表】更新:', contextUserList.length);

    setUsers(prevUsers => {
      // 建立用戶 ID 到用戶物件的映射
      const userMap = {};
      prevUsers.forEach(user => {
        if (user && user.id && user.name) { // 只保留有效用戶
          userMap[user.id] = user;
        }
      });

      // 過濾並合併有效的用戶數據
      return contextUserList
        .filter(user => (
          user &&
          user.id &&
          user.name &&
          // 確保至少有一條消息或時間戳
          (user.lastMessage || user.timestamp || user.unreadCount > 0)
        ))
        .map(contextUser => {
          const existingUser = userMap[contextUser.id];
          if (existingUser) {
            return {
              ...contextUser,
              unreadCount: existingUser.unreadCount ?? contextUser.unreadCount,
              lastMessage: existingUser.lastMessage || contextUser.lastMessage,
              lastMessageType: existingUser.lastMessageType || contextUser.lastMessageType,
              mediaCount: existingUser.mediaCount || contextUser.mediaCount,
              timestamp: existingUser.timestamp || contextUser.timestamp,
              _updateId: existingUser._updateId || Date.now()
            };
          }
          return {
            ...contextUser,
            _updateId: Date.now()
          };
        });
    });
  }, [contextUserList]);

  // // 優化用戶列表更新機制
  // useEffect(() => {
  //   if (contextUserList && contextUserList.length > 0) {
  //     console.log('接收到用戶列表更新，用戶數量:', contextUserList.length);

  //     // 使用 setState 函數直接設置新陣列，不要使用 map
  //     setUsers(contextUserList);

  //     // 添加更多調試信息
  //     contextUserList.forEach(user => {
  //       console.log(`用戶 ${user.id} - ${user.name}: 未讀消息 ${user.unreadCount}, 最新消息 ${user.lastMessage}, 時間: ${user.timestamp}`);
  //     });
  //   }
  // }, [contextUserList]);

  // 移除多餘的定期更新計時器，只保留一個
  useEffect(() => {
    // 單一定時更新，間隔更長以減少性能消耗
    const intervalId = setInterval(() => {
      forceUpdate();
    }, 3000); // 3秒更新一次，頻率降低

    return () => clearInterval(intervalId);
  }, [forceUpdate]);

  const [isOpen, setIsOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 使用 Socket 提供的用戶列表而非靜態數據
  const [activeUserId, setActiveUserId] = useState(null);

  // 使用 Socket 上下文中的消息列表
  const messages = socketMessages; // 直接使用 socketMessages

  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)
  const chatBodyRef = useRef(null)
  const nodeRef = useRef(null)
  const buttonRef = useRef(null)
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isEmojiHovered, setIsEmojiHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [enlargeImage, setEnlargeImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (chatBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
      const bottom = scrollHeight - scrollTop - clientHeight < 20;
      setIsNearBottom(bottom);
      setShowScrollButton(!bottom);
    }
  }, []);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.addEventListener('scroll', handleScroll);
      return () => chatBody.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 分離滾動邏輯
  useEffect(() => {
    if (messages.length > 0) {
      // 只有當用戶在底部附近或新增用戶訊息時才滾動
      const lastMessageIsNew = messages[messages.length - 1].id === Date.now().toString();
      const lastMessageIsFromUser = messages[messages.length - 1].sender === 'user';

      if (isNearBottom && (lastMessageIsNew || lastMessageIsFromUser)) {
        scrollToBottom();
      }
    }
  }, [messages, isNearBottom, scrollToBottom]);


  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 300);
    }
  }, [isOpen, scrollToBottom]);

  // 監聽消息更新
  useEffect(() => {
    if (socketMessages && socketMessages.length > 0) {
      setSocketMessages(socketMessages);
    }
  }, [socketMessages, setSocketMessages]);

  // 添加 useEffect 監聽組件卸載時通知服務器
  useEffect(() => {
    return () => {
      // 當組件卸載或用戶刷新頁面時，通知服務器管理員離開聊天
      if (activeUserId) {
        leaveUserChat(activeUserId);
      }
    };
  }, [activeUserId, leaveUserChat]);

  // 修改 toggleChat 函數，使聊天窗口打開時同時顯示用戶列表
  const toggleChat = () => {
    // 如果目前有選擇用戶且要關閉聊天，通知服務器管理員離開聊天
    if (isOpen) {
      if (activeUserId) {
        leaveUserChat(activeUserId);
      }
      setActiveUserId(null); // 清除選中狀態
    } else {
      setIsMenuOpen(true); // 打開用戶列表
    }
    setIsOpen(!isOpen);
  }


  const handleSelectUser = (userId) => {
    console.log("handleSelectUser - 傳入的 userId:", userId);
    if (activeUserId) {
      leaveUserChat(activeUserId);
    }
    socketSelectUser(userId); // 確認這裡會發送 userId 給 server
    setActiveUserId(userId);
    console.log("handleSelectUser - 更新後的 activeUserId:", userId);
    setIsMenuOpen(false);

    // 若有未讀消息則觸發標記已讀
    const unreadMessages = messages.filter(msg => !msg.read && msg.sender === 'user');
    const messageIds = unreadMessages.map(msg => msg.id);
    if (messageIds.length > 0) {
      setTimeout(() => {
        console.log("markAsRead - 傳入參數:", { messageIds, userId });
        markAsRead({ messageIds, userId });
      }, 500);
    }
  };

  // 修改發送消息函數以使用 Socket
  const handleSendMessage = (e) => {
    e.preventDefault();

    const hasText = newMessage.trim() !== "";
    const hasFiles = selectedFiles.length > 0;

    if (!hasText && !hasFiles) return;

    // 發送文字消息
    if (hasText) {
      const messageData = {
        message: {
          text: newMessage,
        },
        to: activeUserId
      };

      // 只發送消息，不在本地添加
      socketSendMessage(messageData);

      // 清空輸入框
      setNewMessage("");
    }

    // 處理文件發送
    if (hasFiles) {
      selectedFiles.forEach(fileObj => {
        // 調用 sendFileMessage 處理文件發送
        sendFileMessage(fileObj);
      });
    }

    setTimeout(scrollToBottom, 100);
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // 檢查並處理文件
    const validFiles = files.filter(file => {
      // 驗證文件類型
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      // 如果是影片，檢查是否已有影片文件
      if (isVideo && (selectedFiles.some(f => f.type.startsWith('video/')) || files.filter(f => f.type.startsWith('video/')).length > 1)) {
        alert('一次只能上傳一個影片');
        return false;
      }

      return isImage || isVideo;
    });

    // 為每個文件添加 URL 和 ID
    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substring(2),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setSelectedFiles(prev => [...prev, ...filesWithPreview]);
    setIsPreviewOpen(true);

    // 清空 input 以便重複選擇相同文件
    e.target.value = null;
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const filtered = prev.filter(file => file.id !== id);
      if (filtered.length === 0) {
        setIsPreviewOpen(false);
      }
      return filtered;
    });
  };

  // 修改 sendFileMessage 函數中的消息創建
  const sendFileMessage = async (fileObj) => {
    const isImage = fileObj.type === 'image';

    try {
      setUploading(true);

      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', fileObj.file);

      // 發送到服務器
      const response = await fetch('https://lenstudio.onrender.com/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        // 構造消息數據
        const messageData = {
          message: {
            // text: isImage ? '圖片訊息' : '影片訊息',
            fileUrl: result.file.url, // 使用服務器返回的 URL
            fileType: result.file.type
          },
          to: activeUserId
        };

        // 發送到服務器
        socketSendMessage(messageData);

      } else {
        console.error('文件上傳失敗:', result.message);
      }
    } catch (error) {
      console.error('檔案上傳錯誤:', error);
    } finally {
      setUploading(false);
    }

    // 移除已發送的文件
    setSelectedFiles(prev => prev.filter(file => file.id !== fileObj.id));
    if (selectedFiles.length <= 1) {
      setIsPreviewOpen(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setEnlargeImage(imageUrl);
  };

  const closeImageViewer = () => {
    setEnlargeImage(null);
  };

  const onEmojiClick = (emojiData) => {
    // 在游標位置插入 emoji
    setNewMessage(prev =>
      prev.substring(0, document.getElementById('messageInput').selectionStart) +
      emojiData.emoji +
      prev.substring(0, document.getElementById('messageInput').selectionEnd)
    );
  };

  const toggleEmojiPicker = (e) => {
    e.preventDefault();
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target) &&
        !e.target.classList.contains(styles.emojiButton) &&
        !e.target.closest(`.${styles.emojiButton}`)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // 添加這個函數到現有代碼中
  const renderMessageContent = (message) => {
    // 如果消息包含文件URL
    if (message.fileUrl) {
      if (message.fileType === 'image') {
        return (
          <div className={styles.imageContainer}>
            <img
              src={message.fileUrl}
              alt="圖片消息"
              className={styles.messageImage}
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.text && <div className={styles.imageCaption}>{message.text}</div>}
          </div>
        );
      } else if (message.fileType === 'video') {
        return (
          <div className={styles.videoContainer}>
            <video
              src={message.fileUrl}
              controls
              className={styles.messageVideo}
              onError={(e) => console.error("影片加載錯誤", e)}
            />
            {message.text && <div className={styles.videoCaption}>{message.text}</div>}
          </div>
        );
      }
    }

    // 處理文本消息，支持表情符號
    return (
      <div>
        {message.text.split(captureEmojiRegex).map((part, index) => {
          return captureEmojiRegex.test(part) ? (
            <span key={index} className={styles.emoji}>{part}</span>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </div>
    );
  };

  // 在渲染函數中使用 forceUpdate 確保重新渲染
  // 在 return 附近添加此行，不需要在JSX中使用
  const renderTrigger = forceUpdate;

  // 修改現有的事件監聽處理函數
  useEffect(() => {
    // 未讀計數更新事件
    const handleUnreadUpdate = (e) => {
      const { userId, unreadCount } = e.detail;
      console.log(`【未讀更新】用戶=${userId}, 計數=${unreadCount}`);

      // 只使用 React 狀態更新，不直接操作 DOM
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            unreadCount,
            _updateId: Date.now() + Math.random()
          };
        }
        return user;
      }));
    };

    // 最新消息更新事件
    const handleMessageUpdate = (e) => {
      const data = e.detail;
      console.log(`【消息更新】用戶=${data.userId}, 消息=${data.lastMessage}`);

      setUsers(prev => {
        // 先找到指定用戶
        const userIndex = prev.findIndex(u => u.id === data.userId);

        // 建立新陣列而非直接修改
        const newUsers = [...prev];

        // 如果找不到用戶，則添加新用戶
        if (userIndex === -1) {
          newUsers.unshift({
            id: data.userId,
            name: data.userName || '用戶',
            avatar: data.avatar || '/images/chatRoom/user1.jpg',
            lastMessage: data.lastMessage || '',
            lastMessageType: data.lastMessageType || 'text',
            mediaCount: data.mediaCount || 0,
            timestamp: new Date(),
            unreadCount: data.unreadCount || 0,
            _updateId: Date.now()
          });
          return newUsers;
        }

        // 如果找到用戶，更新用戶資訊
        const userToUpdate = { ...newUsers[userIndex] };

        // 從服務器資料中獲取用戶信息，如果存在則更新
        userToUpdate.lastMessage = data.lastMessage || userToUpdate.lastMessage || '';
        userToUpdate.lastMessageType = data.lastMessageType || userToUpdate.lastMessageType || 'text';
        userToUpdate.mediaCount = data.mediaCount || userToUpdate.mediaCount || 0;
        userToUpdate.timestamp = new Date();
        userToUpdate._updateId = Date.now();

        // 保留頭像和名稱，如果服務器傳來新資料則更新
        if (data.avatar) userToUpdate.avatar = data.avatar;
        if (data.userName) userToUpdate.name = data.userName;

        // 移除舊位置
        newUsers.splice(userIndex, 1);
        // 加到最前面
        newUsers.unshift(userToUpdate);

        return newUsers;
      });
    };

    window.addEventListener('chat-unread-update', handleUnreadUpdate);
    window.addEventListener('chat-message-update', handleMessageUpdate);

    return () => {
      window.removeEventListener('chat-unread-update', handleUnreadUpdate);
      window.removeEventListener('chat-message-update', handleMessageUpdate);
    };
  }, [forceUpdate, styles]);

  // 添加一個強力的強制更新機制
  useEffect(() => {
    const handleForceUpdate = (e) => {
      console.log(`【強制更新】類型=${e.detail.type}, 時間=${new Date(e.detail.timestamp).toLocaleTimeString()}`);

      // 直接觸發一次強制刷新
      forceUpdate();

      // 不再無條件覆蓋整個列表，而是智能合併
      if (e.detail.type === 'full-refresh') {
        // 只在需要完整刷新時才替換整個列表
        setUsers([...contextUserList]);
      }
    };

    window.addEventListener('force-chat-update', handleForceUpdate);

    return () => {
      window.removeEventListener('force-chat-update', handleForceUpdate);
    };
  }, [contextUserList, forceUpdate]);

  useEffect(() => {
    console.log("訊息狀態已更新:", messages);
    // 不需要額外設置，只需確保使用 context 中的訊息狀態
  }, [messages]);


  // 合併兩個重複的 useEffect
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log('收到新消息:', message);

      // 進階調試
      console.log(`檢查消息: message.userId=${message.userId}, activeUserId=${activeUserId}, 匹配=${message.userId === activeUserId}`);

      // 當收到新訊息，且是來自目前正在查看的用戶
      if (message.userId === activeUserId) {
        // 在添加消息前檢查是否已存在相同 ID 的消息
        setSocketMessages(prev => {
          // 檢查是否已經存在相同 ID 的消息
          if (prev.some(m => m.id === message.id)) {
            console.log(`消息 ID ${message.id} 已存在，不重複添加`);
            return prev;
          }

          // 添加新消息
          console.log(`將消息添加到用戶 ${activeUserId} 的聊天窗口`);
          return [...prev, message];
        });

        // 如果是新消息且未讀，立即標記為已讀
        if (!message.read && message.sender === 'user') {
          console.log('管理員正在查看該用戶，立即標記訊息為已讀');
          markAsRead({
            messageIds: [message.id],
            userId: activeUserId
          });
        }
      } else {
        // 如果不是當前用戶的消息，只在控制台記錄
        console.log(`消息被過濾: 來自用戶 ${message.userId}，當前查看的是 ${activeUserId}`);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeUserId, setSocketMessages, markAsRead]);

  useEffect(() => {
    if (!socket) return;

    const handleChatHistory = (chatHistory) => {
      console.log('收到 chat_history 更新:', chatHistory);
      setSocketMessages(chatHistory);
    };

    socket.on('chat_history', handleChatHistory);

    return () => {
      socket.off('chat_history', handleChatHistory);
    };
  }, [socket, setSocketMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = (payload) => {
      console.log('管理員收到 messages_read 更新:', payload);
      const messageIds = Array.isArray(payload) ? payload : payload.messageIds;
      if (!messageIds) return;
      setSocketMessages(prev => prev.map(msg =>
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      ));
    };

    socket.on('messages_read', handleMessagesRead);
    return () => {
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, setSocketMessages]);

  // useEffect(() => {
  //   // 如果有未讀消息且目前正在檢視該用戶，自動標記為已讀
  //   if (isOpen && activeUserId && messages && messages.length > 0) {
  //     const unreadMessages = messages.filter(msg =>
  //       !msg.read && msg.sender === 'user'
  //     );

  //     if (unreadMessages.length > 0) {
  //       const messageIds = unreadMessages.map(msg => msg.id);
  //       console.log('主動標記訊息已讀:', messageIds);
  //       markAsRead({ messageIds, userId: activeUserId });
  //     }
  //   }
  // }, [messages, isOpen, activeUserId]);

  // useEffect(() => {
  //   if (isOpen && activeUserId && messages && messages.length > 0) {
  //     // 找出所有來自用戶且尚未標記為已讀的訊息
  //     const unreadMessages = messages.filter(msg => !msg.read && msg.sender === 'user');
  //     if (unreadMessages.length > 0) {
  //       const messageIds = unreadMessages.map(msg => msg.id);
  //       console.log('自動標記訊息為已讀:', messageIds);
  //       markAsRead({ messageIds, userId: activeUserId });
  //     }
  //   }
  // }, [messages, isOpen, activeUserId]);

  useEffect(() => {
    if (isOpen && activeUserId) {
      // 過濾所有來自 user 且未讀的訊息
      const unreadMessages = messages.filter(msg => msg.sender === 'user' && !msg.read);
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        console.log('即時標記訊息為已讀:', messageIds, "時間:", new Date().toLocaleTimeString());
        markAsRead({ messageIds, userId: activeUserId });
      }
    }
  }, [messages, isOpen, activeUserId, markAsRead]);

  // 新增一個專門監聽新訊息的 useEffect
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (message) => {
      console.log('收到新訊息:', message);
      // 如果是來自當前選擇用戶的未讀訊息
      if (activeUserId === message.userId && message.sender === 'user' && !message.read) {
        console.log('立即標記新訊息為已讀:', message.id);
        // 立即標記為已讀
        setTimeout(() => {
          markAsRead({
            messageIds: [message.id],
            userId: activeUserId
          });
        }, 100);
      }
    };
    
    socket.on('receive_message', handleNewMessage);
    
    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, activeUserId, markAsRead]);

  return (
    <div className={styles.chatWidgetContainer}>
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames={{
          enter: styles.chatWindowEnter,
          enterActive: styles.chatWindowEnterActive,
          exit: styles.chatWindowExit,
          exitActive: styles.chatWindowExitActive,
        }}
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className={styles.chatWindow}>
          <div className={styles.mainChat}>
            {/* 用戶列表側欄 */}
            <div className={`${styles.userListPanel} ${isMenuOpen ? styles.show : ''}`}>
              <div className={styles.userListHeader}>
                {/* <button
                  className={styles.backButton}
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="返回"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button> */}
                <h5>聊天列表</h5>
                <button className={styles.iconButton} onClick={toggleChat}>
                  <X size={24} />
                </button>
              </div>
              {/* 修改用戶列表渲染部分 */}
              <div className={styles.userList}>
                {users.map((user, index) => {
                  // 確保每次重新渲染時都有唯一且穩定的key
                  const renderKey = `user-${user.id}-${index}-${user._updateId || ''}`;

                  // 創建一個封裝函數來處理時間格式化邏輯
                  const timeDisplay = (() => {
                    try {
                      if (!user.timestamp) return '剛剛';

                      // 統一將時間戳轉換為 Date 對象
                      const timestamp = user.timestamp instanceof Date
                        ? user.timestamp
                        : typeof user.timestamp === 'string'
                          ? new Date(user.timestamp)
                          : new Date();

                      return formatRelativeMessageTime(timestamp);
                    } catch (err) {
                      console.error(`時間格式化錯誤 (用戶=${user.id}):`, err);
                      return '剛剛';
                    }
                  })();

                  return (
                    <div
                      key={renderKey}
                      data-user-id={user.id}
                      className={`${styles.userItem}`}
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <div className={styles.userAvatar}>
                        <img
                          src={user.avatar || "/images/chatRoom/user1.jpg"}
                          alt={user.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/chatRoom/user1.jpg";
                          }}
                        />
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userInfoHeader}>
                          <span className={styles.userName}>
                            {user.name} {/* 這裡會自動顯示 nickname 或 name */}
                          </span>
                          <small className={styles.messageTime}>{timeDisplay}</small>
                        </div>
                        <div className={styles.lastMessageRow}>
                          <p className={styles.userLastMessage}>
                            {user.lastMessageType === 'text'
                              ? (user.lastMessage || '暫無訊息')
                              : user.lastMessageType === 'image'
                                ? `已傳送${user.mediaCount || 1}張圖片`
                                : `已傳送${user.mediaCount || 1}個影片`}
                          </p>
                          {user.unreadCount > 0 && (
                            <span
                              className={`${styles.unreadBadge} unreadBadge ${user.unreadCount >= 100 ? styles.unreadBadgePill : styles.unreadBadgeCircle}`}
                              style={{ display: 'flex' }}
                            >
                              {user.unreadCount > 99 ? '99+' : user.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 現有的聊天區域 */}
            <div className={`${styles.chatArea} ${isMenuOpen ? styles.shifted : ''}`}>
              <div className={styles.chatHeader}>
                {/* 添加 Hamburger 按鈕 */}
                <div className={styles.hamburgerContainer}>
                  <Squeeze
                    size={16}
                    color="white"
                    duration={0.3}
                    toggled={isMenuOpen}
                    toggle={() => {
                      // 當要打開選單並且目前有選定用戶時，通知伺服器離開聊天室
                      if (!isMenuOpen && activeUserId) {
                        console.log(`管理員打開選單，離開用戶 ${activeUserId} 的聊天室`);
                        leaveUserChat(activeUserId);
                      }
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    easing="ease-in"
                    label="顯示選單"
                  />
                </div>

                <div className={styles.headerUserInfo}>
                  <div className={styles.headerUserName}>
                    {activeUserId ? users.find(user => user.id === activeUserId)?.name : '請選擇用戶'}
                  </div>
                </div>

                <button className={styles.iconButton} onClick={toggleChat}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.chatBody} ref={chatBodyRef} onScroll={handleScroll}>
                <div className={styles.messagesContainer}>
                  {messages.map((message, index) => {
                    const isPrevSameSender = index > 0 && messages[index - 1].sender === message.sender;
                    const isNextSameSender = index < messages.length - 1 && messages[index + 1].sender === message.sender;

                    // 檢查是否需要顯示時間標記 - 當發送者改變時
                    const isPrevDifferentSender = index > 0 && messages[index - 1].sender !== message.sender;

                    // 檢查是否與前一則訊息日期不同 - 跨天顯示
                    const isPrevDifferentDay = index > 0 &&
                      !isSameDay(new Date(messages[index - 1].timestamp), new Date(message.timestamp));

                    // 顯示時間的條件：發送者變更或跨天
                    const shouldShowTime = isPrevDifferentSender || isPrevDifferentDay;

                    // 決定氣泡類型
                    let bubblePosition = '';
                    if (!isPrevSameSender && !isNextSameSender) {
                      bubblePosition = 'single';
                    } else if (!isPrevSameSender && isNextSameSender) {
                      bubblePosition = 'first';
                    } else if (isPrevSameSender && isNextSameSender) {
                      bubblePosition = 'middle';
                    } else {
                      bubblePosition = 'last';
                    }

                    const showAvatar = !isNextSameSender;

                    const regex = emojiRegex();

                    return (
                      <React.Fragment key={`msg-${message.id}-${index}`}>
                        {/* 時間標記 */}
                        {shouldShowTime && (
                          <div className={styles.timeLabel}>
                            {formatAbsoluteMessageTime(message.timestamp)}
                          </div>
                        )}

                        {/* 原本的訊息行 */}
                        <div
                          className={`${styles.messageRow} ${message.sender === "agent" ? styles.agentMessageRow : styles.userMessageRow}`}
                        >
                          {/* 修改為只在user消息時顯示頭像 */}
                          {message.sender === "user" && showAvatar && (
                            <div className={styles.avatarContainer}>
                              <img
                                src={message.avatar}
                                alt={message.senderName}
                                className={styles.avatar}
                              />
                            </div>
                          )}

                          <div
                            className={`${styles.message} ${message.sender === "agent" ? styles.agentMessage : styles.userMessage} ${styles[`bubble-${bubblePosition}`]}`}
                          >
                            {/* 已讀標記僅對管理員發出的消息顯示 */}
                            {message.sender === "agent" && (
                              <div className={styles.messageStatus}>
                                {message.read ? (
                                  <CheckAll size={16} className={styles.readIcon} />
                                ) : (
                                  <Check size={16} className={styles.unreadIcon} />
                                )}
                              </div>
                            )}
                            <div className={styles.messageContent}>
                              {message.fileType ? (
                                message.fileType === 'image' ? (
                                  <img
                                    src={message.fileUrl}
                                    alt="圖片訊息"
                                    className={styles.messageImage}
                                    onClick={() => handleImageClick(message.fileUrl)}
                                  />
                                ) : (
                                  <video controls className={styles.messageVideo}>
                                    <source src={message.fileUrl} type="video/mp4" />
                                    您的瀏覽器不支持影片播放
                                  </video>
                                )
                              ) : (
                                <div className={styles.messageText}>
                                  {renderMessageContent(message)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  {showScrollButton && (
                    <button
                      className={`${styles.scrollToBottomButton} ${styles.visible}`}
                      onClick={scrollToBottom}
                      aria-label="滾動到底部"
                    >
                      <ChevronDown />
                    </button>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className={styles.chatFooter}>
                {isPreviewOpen && (
                  <div className={styles.filePreviewArea}>
                    {selectedFiles.map((fileObj) => (
                      <div key={fileObj.id} className={styles.filePreviewItem}>
                        <button
                          className={styles.removeFileButton}
                          onClick={() => removeFile(fileObj.id)}
                        >
                          <X size={14} />
                        </button>
                        {fileObj.type === 'image' ? (
                          <img src={fileObj.url} alt="預覽" />
                        ) : (
                          <video>
                            <source src={fileObj.url} type={fileObj.file.type} />
                            您的瀏覽器不支持影片預覽
                          </video>
                        )}
                        {/* 移除單獨的發送按鈕 */}
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className={styles.messageForm}>
                  <div className={styles.inputContainer}>
                    <input
                      id="messageInput"
                      type="text"
                      placeholder="輸入訊息..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className={styles.messageInput}
                      autoComplete="off"
                    />
                  </div>
                  <div className="image-send-emoji-btn d-flex align-items-center">
                    <div className={styles.emojiButtonContainer}>
                      <button
                        type="button"
                        className={styles.emojiButton}
                        onMouseEnter={() => setIsEmojiHovered(true)}
                        onMouseLeave={() => setIsEmojiHovered(false)}
                        onClick={toggleEmojiPicker}
                      >
                        <img
                          src={isEmojiHovered
                            ? "/images/chatRoom/emoji-active.svg"
                            : "/images/chatRoom/emoji-origin.svg"}
                          alt=""
                        />
                      </button>
                      {showEmojiPicker && (
                        <div className={styles.emojiPickerContainer} ref={emojiPickerRef}>
                          <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            width={300}
                            height={400}
                            defaultSkinTone={SkinTones.MEDIUM}
                            searchDisabled
                            previewConfig={{ showPreview: false }}
                            theme="light" // 或 'dark' 或 'auto'
                            emojiStyle="native"
                            categories={['smileys_people', 'animals_nature', 'food_drink', 'travel_places', 'activities', 'objects', 'symbols', 'flags']}
                          />
                        </div>
                      )}
                    </div>
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className={styles.imageButton}
                        onMouseEnter={() => setIsImageHovered(true)}
                        onMouseLeave={() => setIsImageHovered(false)}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <img
                          src={isImageHovered
                            ? "/images/chatRoom/image-update-active.svg"
                            : "/images/chatRoom/image-update-origin.svg"}
                          alt="上傳圖片或影片"
                        />
                      </button>
                    </>
                    <button
                      type="submit"
                      className={styles.sendButton}
                      disabled={newMessage.trim() === "" && selectedFiles.length === 0}
                    >
                      <img src="/images/chatRoom/send-origin.svg" alt="" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>

      <div className={styles.chatButtonWrapper}>
        <CSSTransition
          in={!isOpen}
          timeout={300}
          classNames={{
            enter: styles.chatButtonEnter,
            enterActive: styles.chatButtonEnterActive,
            exit: styles.chatButtonExit,
            exitActive: styles.chatButtonExitActive,
          }}
          unmountOnExit
          nodeRef={buttonRef}
        >
          <Button ref={buttonRef} variant="primary" className={styles.chatButton} onClick={toggleChat}>
            <img src="/images/chatRoom/server-origin.svg" alt="" />
          </Button>
        </CSSTransition>
      </div>

      {enlargeImage && (
        <div className={styles.imageViewerOverlay} onClick={closeImageViewer}>
          <div className={styles.imageViewerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageViewerClose} onClick={closeImageViewer}>
              <X size={24} />
            </button>
            <img src={enlargeImage} alt="放大圖片" className={styles.enlargedImage} />
          </div>
        </div>
      )}
    </div>
  )
}

