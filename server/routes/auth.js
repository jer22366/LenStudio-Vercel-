// 測試課程中心
import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "../db.js";

dotenv.config(); // ✅ 確保環境變數載入

import { verifyFirebaseToken } from "../firebaseAdmin.js";

const router = express.Router();
const secretKey = process.env.JWT_SECRET_KEY;

//line登入
router.post("/line", async (req, res) => {
  console.log("📥 收到的 req.body:", req.body);
  const { code } = req.body;

  if (!code) {
    console.error("❌ 未提供授權碼 (code)");
    return res.status(400).json({ message: "請提供授權碼 (code)" });
  }

  try {
    console.log("📥 LINE 授權碼:", code);

    // 1️⃣ 交換 `code` 獲取 `access_token`
    const tokenResponse = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINE_REDIRECT_URI, // ✅ 從環境變數讀取
        client_id: process.env.LINE_CLIENT_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      }).toString(), // ✅ 確保為字串
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // 2️⃣ 用 `access_token` 獲取 LINE 用戶資訊
    const profileResponse = await axios.get("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { displayName, pictureUrl } = profileResponse.data;
    const lineUserId = profileResponse.data.userId || profileResponse.data.sub; // ✅ 確保 `userId` 存在
    console.log("👤 LINE 用戶資訊:", profileResponse.data);

    if (!lineUserId) {
      return res.status(400).json({ message: "無法獲取 LINE 使用者 ID" });
    }

    // 3️⃣ 檢查 MySQL 是否已有該用戶
    const sqlCheck = "SELECT * FROM users WHERE account = ?";
    const [rows] = await db.execute(sqlCheck, [lineUserId]);

    let user;

    if (rows.length > 0) {
      // ✅ 用戶已存在，更新頭像
      user = rows[0];
      const sqlUpdate = "UPDATE users SET head = ? WHERE account = ?";
      await db.execute(sqlUpdate, [pictureUrl, lineUserId]);
    } else {
      // ✅ 新增用戶
      const hashedPassword = await bcrypt.hash(lineUserId, 10);
      const sqlInsert =
        "INSERT INTO users (account, password, name, head) VALUES (?, ?, ?, ?)";
      const [result] = await db.execute(sqlInsert, [
        lineUserId,
        hashedPassword,
        displayName,
        pictureUrl,
      ]);

      user = {
        id: result.insertId,
        account: lineUserId,
        name: displayName,
        head: pictureUrl,
      };
    }

    // 4️⃣ 生成 JWT Token
    const authToken = jwt.sign(
      {
        id: user.id,
        account: user.account,
        name: user.name,
        email: user.email || "",
        head: user.head,
        level: user.level || 1, // 預設 level
      },
      secretKey,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      data: { token: authToken, user },
      message: "LINE 登入成功",
    });
  } catch (err) {
    console.error("❌ LINE 登入錯誤:", err.response ? err.response.data : err.message);
    res.status(500).json({ status: "error", message: "LINE 登入失敗" });
  }
});
// line end
// Google 登入
router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Token 必須提供" });

  try {
    // ✅ 驗證 Firebase Token
    const userData = await verifyFirebaseToken(token);
    if (!userData) return res.status(401).json({ message: "無效的 Token" });

    const { uid, email, name, picture } = userData; // ✅ 取得 Google 照片 URL

    // ✅ 檢查使用者是否已存在
    const sqlCheck = "SELECT * FROM users WHERE account = ?";
    const [rows] = await db.execute(sqlCheck, [email]);

    let user;

    if (rows.length > 0) {
      // ✅ 使用者已存在，更新大頭貼
      user = rows[0];
      const sqlUpdate = "UPDATE users SET head = ? WHERE account = ?";
      await db.execute(sqlUpdate, [picture, email]);
    } else {
      // ✅ 使用者不存在，新增使用者
      const hashedPassword = await bcrypt.hash(uid, 10); // 設定一個隨機密碼
      const sqlInsert = "INSERT INTO users (account, password, name, head) VALUES (?, ?, ?, ?)";
      const [result] = await db.execute(sqlInsert, [email, hashedPassword, name, picture]);

      user = { id: result.insertId, account: email, name, head: picture };
    }

    // ✅ 生成 JWT Token
    const authToken = jwt.sign(
      { 
        id: user.id,
        account: user.account,
        name: user.name,
        nickname: user.nickname || "",
        mail: user.mail,
        head: user.head,
        level: user.level,
        birthday: user.birthday
          ? (() => {
            const date = new Date(user.birthday);
            date.setDate(date.getDate() + 1); // ✅ 加一天
            return date.toISOString().split("T")[0]; // ✅ 轉回 `YYYY-MM-DD`
          })()
          : "",
      },
      secretKey,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      data: { token: authToken, user },
      message: "Google 登入成功",
    });
  } catch (err) {
    console.error("❌ Google 登入錯誤:", err);
    res.status(500).json({ status: "error", message: "Google 登入失敗" });
  }
});
//google end////

// 🔹 登入 API，提供 `mail` & `password`，回傳 `level`
router.post("/login", async (req, res) => {
  const { account, password } = req.body;

  try {
    if (!account || !password) throw new Error("請提供帳號和密碼");

    const sql = "SELECT * FROM `users` WHERE account = ?";
    const [rows] = await db.execute(sql, [account]);

    if (rows.length === 0) throw new Error("找不到使用者");

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("帳號或密碼錯誤");

    // 生成 JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        account: user.account,
        name: user.name,
        email: user.email,
        level: user.level, // ✅ 傳回 level
      },
      secretKey,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      data: { token, user },
      message: "登入成功",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: err.message || "登入失敗",
    });
  }
});

export default router;
