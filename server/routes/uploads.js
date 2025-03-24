import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 確保上傳目錄存在
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 設置檔案存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `chat-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage: storage });

// 文件上傳路由
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: '沒有檔案' });
  }

  // 返回可公開訪問的 URL
  const publicUrl = `https://lenstudio.onrender.com/uploads/chat/${req.file.filename}`;

  res.json({
    status: 'success',
    file: {
      url: publicUrl,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      originalName: req.file.originalname
    }
  });
});

export default router;