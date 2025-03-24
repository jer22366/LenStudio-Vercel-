import express, { Router } from 'express'
import cors from 'cors'
import pool from '../db.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Swal from 'sweetalert2';
dotenv.config();


const router = express.Router()
const OTP_DB = {}; // 暫存 OTP（正式應存入 DB）
const USERS = {}; // 假設的使用者資料

//cors設定
const corsOptions = {
    origin: ['http://localhost:3000','https://lenstudio.vercel.app/'], // 允許來自 http://localhost:3000 的請求
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  };
router.use(cors(corsOptions)); // 使用 cors 中間件
//忘記密碼OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 環境變數存放密碼
  }
});

// 📌 產生 OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// 📌 模擬資料庫


// 📌 1️⃣ 發送 OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: '請提供 Email' });
  
    try {
      // 🔹 查詢是否有該 Email 的使用者
      const [user] = await pool.execute("SELECT * FROM users WHERE account = ?", [email]);
      
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: '該 Email 未註冊' });
        
      }
  
      // 🔹 產生 OTP
      const otp = generateOTP();
      OTP_DB[email] = otp; // 儲存 OTP
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '您的 OTP 驗證碼',
        text: `您的 OTP 是 ${otp}，5 分鐘內有效。`
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'OTP 已發送' });
  
    } catch (error) {
      console.error('OTP 發送失敗:', error);
      res.status(500).json({ success: false, message: 'OTP 發送失敗' });
    }
  });
  

// 📌 2️⃣ 驗證 OTP 並產生 JWT Token

router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;  // ⚠️ email 其實是 `account`
  
    if (!email || !otp) return res.status(400).json({ success: false, message: '請提供 Account 和 OTP' });
  
    if (OTP_DB[email] === otp) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
      delete OTP_DB[email]; // ✅ OTP 驗證後立即刪除
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, message: 'OTP 錯誤或已過期' });
    }
  });
  

// 📌 3️⃣ 使用 JWT 來重設密碼
router.post('/reset-password', async (req, res) => {
    const { account, newPassword } = req.body;  // 👈 改成 `account`
  
    if (!account || !newPassword) {
      return res.status(400).json({ success: false, message: '請提供 Account 和新密碼' });
    }
  
    try {
      // 檢查用戶是否存在
      const userQuery = await pool.query("SELECT * FROM users WHERE account = ?;", [account]);
      if (userQuery.rowCount === 0) {
        return res.status(404).json({ success: false, message: '用戶不存在' });
      }
  
      // 加密新密碼
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // 更新密碼
      await pool.query("UPDATE users SET password = ? WHERE account = ?", [hashedPassword, account]);
  
      res.json({ success: true, message: '密碼已重設' });
    } catch (error) {
      console.error('資料庫錯誤:', error);
      res.status(500).json({ success: false, message: '內部伺服器錯誤' });
    }
  });
  
  
  
  


//忘記密碼END



export default router