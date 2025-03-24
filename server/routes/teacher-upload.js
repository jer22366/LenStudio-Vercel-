import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import authenticate from "../middlewares.js";
import pool from "../db.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "/public/uploads/images/teacher");

// **Multer 設定**
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(uploadDir);
    } catch {
      // console.log("📂 目錄不存在，嘗試創建...");
      await fs.mkdir(uploadDir, { recursive: true });
      // console.log("✅ 目錄創建成功:", uploadDir);
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

const upload = multer({ storage });

// **講師圖片上傳並更新資料庫**
// **講師圖片上傳並更新資料庫**
router.post("/", authenticate, upload.single("upload"), async (req, res) => {
  const userId = req.userId; // 從 Token 取得 userId

  if (!req.file) {
    return res.status(400).json({ error: "❌ 沒有選擇圖片" });
  }

  const imageUrl = `https://lenstudio.onrender.com/uploads/images/teacher/${req.file.filename}`;

  try {
    // **更新講師資料**
    const [updateResult] = await pool.query(
      "UPDATE teachers SET image = ? WHERE user_id = ?",
      [imageUrl, userId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "❌ 找不到講師，無法更新頭像" });
    }

    // console.log(`✅ 老師頭像更新成功: ${imageUrl}`);
    res.json({ message: "✅ 老師頭像更新成功！", image_url: imageUrl }); // ✅ 確保正確回傳
  } catch (error) {
    console.error("❌ 更新老師頭像失敗:", error);
    res.status(500).json({ error: "無法更新頭像" });
  }
});


export default router;
