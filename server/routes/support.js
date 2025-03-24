import express from 'express';
import pool from '../db.js';
import authenticate from '../middlewares.js';
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'

const router = express.Router();



// ✅ 取得所有對話列表
router.get("/conversations", authenticate, async (req, res) => {
  try {
    // console.log("🔍 `req.user`: ", req.user);

    if (!req.user) {
      return res.status(401).json({ error: "未授權，請重新登入" });
    }

    let query;
    let params = [];

    if (req.user.level === 88) {
      // ✅ 管理員可以獲取所有對話
      // console.log("✅ 管理員登入，查詢所有對話");
      query = `
        SELECT 
          c.id, 
          u.name AS user_name, 
          u.head AS user_avatar, 
          c.last_message AS lastMessage, 
          c.updated_at AS updated_at
        FROM conversations c
        LEFT JOIN users u ON c.user_id = u.id;
      `;
    } else {
      // ✅ 老師只能獲取「自己的對話」
      // console.log(`✅ 老師 (${req.user.id}) 登入，查詢自己的對話`);
      query = `
        SELECT 
          c.id, 
          u.name AS user_name, 
          u.head AS user_avatar, 
          c.last_message AS lastMessage, 
          c.updated_at AS updated_at
        FROM conversations c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.user_id = ?;
      `;
      params = [req.user.id];
    }

    // console.log("🔍 執行 SQL:", query);
    const [rows] = await pool.query(query, params);
    // console.log("✅ 取得對話列表:", rows);

    if (rows.length === 0 && req.user.level !== 88) {
      console.warn(`⚠️ 老師 (${req.user.id}) 沒有對話，建立新對話...`);

      // **新增對話**
      const insertQuery = `INSERT INTO conversations (user_id) VALUES (?)`;
      const [result] = await pool.query(insertQuery, [req.user.id]);

      if (result.affectedRows > 0) {
        // console.log("✅ 成功建立新對話");
        const newChat = {
          id: result.insertId,
          user_name: req.user.name,
          user_avatar: req.user.head || "/uploads/default-avatar.png",
          lastMessage: null,
          updated_at: null,
        };
        return res.json([newChat]); // 回傳新對話
      } else {
        console.error("❌ 無法建立新對話");
        return res.status(500).json({ error: "無法建立新對話" });
      }
    }

    res.json(rows);
  } catch (error) {
    console.error("❌ 伺服器錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤", details: error.message });
  }
});





// ✅ 取得某個對話的歷史訊息
router.get("/messages/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: "缺少 chatId 參數" });
    }

    const query = `
    SELECT 
      m.sender_id, 
      m.text, 
      m.type,  -- ✅ 加入 type 欄位，確保前端知道訊息類型
      m.created_at,
      u.name AS sender_name, 
      u.head AS user_avatar  -- ✅ 取得發送者的名稱與頭貼
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id  -- 🔗 連接 users 資料表
    WHERE m.chat_id = ?
    ORDER BY m.created_at ASC
  `;

    const [messages] = await pool.query(query, [chatId]);

    // console.log(`✅ 取得 chat_id ${chatId} 的歷史訊息:`, messages);

    res.json(messages);
  } catch (error) {
    console.error("❌ 取得歷史訊息失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});



// ✅ 設定圖片上傳目錄
const uploadDir = path.join(process.cwd(), "/public/uploads/images/chat-messages");

// ✅ 設定 Multer 存儲規則
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, fileExt);
    const filename = `${timestamp}-${originalName}${fileExt}`;
    cb(null, filename);
  },
});

// ✅ 限制檔案類型
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/avif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ 只能上傳圖片格式 (JPG, PNG, GIF, AVIF, WEBP)"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/messages", authenticate, upload.single("upload"), async (req, res) => {
  try {
    // console.log("📩 伺服器收到請求:", req.body, req.file);

    let { chatId, text, is_bot } = req.body;
    let senderId = req.user.id;
    let messageType = "text"; // 預設為文字訊息
    let messageContent = text ? text.trim() : "";

    // ✅ 確保 `chatId` 轉換為數字（避免 `null` 或 `undefined`）
    chatId = chatId && !isNaN(chatId) ? Number(chatId) : null;

    // ✅ 如果是機器人訊息，設定固定 senderId
    if (is_bot) {
      senderId = 35;
    }

    // ✅ 如果有圖片，則設定為圖片訊息，並產生完整 URL
    if (req.file) {
      messageType = "image";
      const filePath = `/uploads/images/chat-messages/${req.file.filename}`;
      messageContent = `https://lenstudio.onrender.com${filePath}`; // 🔹 加上完整 URL
      // console.log("📂 圖片已成功上傳:", messageContent);
    }

    if (!messageContent && !req.file) {
      return res.status(400).json({ error: "請提供文字或圖片" });
    }

    // ✅ 如果 `chatId` 為空，創建新對話
    if (!chatId) {
      // console.log("🔄 `chatId` 為空，創建新對話...");
      const [newChat] = await pool.query(
        "INSERT INTO conversations (user_id, last_message) VALUES (?, ?)",
        [senderId, messageContent]
      );

      if (!newChat.insertId) {
        return res.status(500).json({ error: "無法創建新對話" });
      }
      chatId = newChat.insertId;
      // console.log("🆕 創建新對話 `chatId`:", chatId);
    } else {
      // console.log("🔍 檢查 `chatId` 是否存在:", chatId);
      const [existingChat] = await pool.query("SELECT id FROM conversations WHERE id = ?", [chatId]);

      if (existingChat.length === 0) {
        return res.status(400).json({ error: "無效的 chatId" });
      }
    }

    // ✅ 存入訊息
    // console.log("💾 插入訊息:", { chatId, senderId, messageType, messageContent });
    await pool.query(
      "INSERT INTO messages (chat_id, sender_id, text, type) VALUES (?, ?, ?, ?)",
      [chatId, senderId, messageContent, messageType]
    );

    // ✅ 更新 conversations 的 `last_message`
    await pool.query("UPDATE conversations SET last_message = ?, updated_at = NOW() WHERE id = ?", [
      messageContent,
      chatId,
    ]);

    // ✅ 取得 `updated_at`
    const [updatedRows] = await pool.query("SELECT updated_at FROM conversations WHERE id = ?", [chatId]);
    const updated_at = updatedRows.length > 0 ? updatedRows[0].updated_at : new Date();

    // console.log("✅ 訊息成功存入資料庫");

    // ✅ 取得發送者資訊
    let user_avatar = null;
    let sender_name = null;
    const [rows] = await pool.query("SELECT name AS sender_name, head AS user_avatar FROM users WHERE id = ?", [
      senderId,
    ]);
    if (rows.length > 0) {
      sender_name = rows[0].sender_name;
      user_avatar = rows[0].user_avatar;
    }

    // ✅ 廣播 WebSocket 訊息
    const io = req.app.get("io");
    if (io) {
      io.emit("newMessage", {
        chatId,
        sender_id: senderId,
        text: messageContent,
        type: messageType,
        created_at: new Date(),
        user_avatar,
        sender_name,
      });
      // console.log("📡 廣播 newMessage 事件:", { chatId, sender_id: senderId, text: messageContent });

      io.emit("conversationUpdated", {
        chatId,
        lastMessage: messageContent,
        updated_at: updated_at,
      });
      // console.log("📡 廣播 conversationUpdated 事件:", { chatId, lastMessage: messageContent, updated_at });
    } else {
      console.warn("❌ 無法取得 io 實例");
    }

    res.status(201).json({
      message: "訊息已發送",
      chatId,
      type: messageType,
      content: messageContent
    });

  } catch (error) {
    console.error("❌ 伺服器錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});


export default router;
