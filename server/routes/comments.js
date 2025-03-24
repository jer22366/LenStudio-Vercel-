import { Router } from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: '12345',
  database: 'lenstudio',
})

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000','https://lenstudio.vercel.app/'],
  credentials: true, // 確保 credentials 為 true
}

const router = Router()
router.use(cors(corsOptions))

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 設定 multer storage，將檔案儲存在 images/article_com_media，檔名以當前時間命名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, '../../client/public/images/article_com_media')
    )
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = Date.now() + ext
    cb(null, uniqueName)
  },
})
const upload = multer({ storage })

// 修改查詢，確保巢狀回覆也能取得媒體資料
router.get('/', async (req, res) => {
  const { articleId } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT 
        ac.*,
        u.head,
        u.nickname,
        u.name,
        GROUP_CONCAT(DISTINCT cm.media_url) AS media_urls,
        GROUP_CONCAT(DISTINCT cm.media_type) AS media_types,
        IF(ac.updated_at > ac.created_at, 1, 0) AS is_edited
       FROM article_comments AS ac
       LEFT JOIN users AS u ON ac.user_id = u.id
       LEFT JOIN comments_media AS cm ON ac.id = cm.comment_id AND cm.is_deleted = 0
       WHERE ac.article_id = ? AND ac.is_deleted = 0
       GROUP BY ac.id
       ORDER BY ac.parent_id IS NULL DESC, ac.created_at DESC`,
      [articleId]
    );

    // 處理每個留言的媒體資料
    const comments = rows.map(row => ({
      ...row,
      media_urls: row.media_urls ? row.media_urls.split(',') : [],
      media_types: row.media_types ? row.media_types.split(',') : []
    }));

    res.status(200).json({ comments });
  } catch (err) {
    console.error('取得留言失敗：', err);
    res.status(500).json({
      status: 'error',
      message: err.message || '取得留言失敗'
    });
  }
});

router.get('/count', async (req, res) => {
  const { articleId } = req.query;
  if (!articleId) {
    return res.status(400).json({
      status: 'error',
      message: 'articleId 為必填'
    });
  }
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM article_comments WHERE article_id = ? AND is_deleted = 0',
      [articleId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('取得留言數量錯誤：', err);
    res.status(500).json({
      status: 'error',
      message: '取得留言數量失敗'
    });
  }
});

// 新增留言 API：將留言內容存入 article_comments 資料表，若有附檔則存入 comments_media
// 接受欄位 media，可能多筆檔案
router.post('/', upload.array('media'), async (req, res) => {
  let { content, articleId, userId, parentId, gifUrl } = req.body;

  console.log('收到的請求資料：', {
    content,
    articleId,
    userId,
    parentId,
    gifUrl,
    files: req.files
  });

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. 新增主留言
      const [result] = await connection.query(
        `INSERT INTO article_comments (article_id, content, user_id, parent_id, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [articleId, content || '', userId, parentId || null]
      );
      const commentId = result.insertId;

      // 2. 處理媒體檔案
      if (req.files && req.files.length > 0) {
        const file = req.files[0]; // 取第一個檔案
        const mediaType = file.mimetype.startsWith('video/') ? 'video' :
          file.mimetype === 'image/gif' ? 'gif' : 'image';

        await connection.query(
          `INSERT INTO comments_media (comment_id, media_type, media_url) 
           VALUES (?, ?, ?)`,
          [commentId, mediaType, file.filename]
        );
      }

      // 3. 處理 GIF URL
      if (gifUrl && gifUrl.trim()) {
        await connection.query(
          `INSERT INTO comments_media (comment_id, media_type, media_url) 
           VALUES (?, 'gif', ?)`,
          [commentId, gifUrl]
        );
      }

      await connection.commit();

      // 4. 回傳新增的留言資料
      const [newComment] = await connection.query(
        `SELECT 
          ac.*,
          u.head,
          u.nickname,
          u.name,
          GROUP_CONCAT(DISTINCT cm.media_url) as media_urls,
          GROUP_CONCAT(DISTINCT cm.media_type) as media_types
         FROM article_comments ac
         LEFT JOIN users u ON ac.user_id = u.id
         LEFT JOIN comments_media cm ON ac.id = cm.comment_id
         WHERE ac.id = ?
         GROUP BY ac.id`,
        [commentId]
      );

      // 立即更新前端顯示
      const comment = newComment[0];
      comment.media_urls = comment.media_urls ? comment.media_urls.split(',') : [];
      comment.media_types = comment.media_types ? comment.media_types.split(',') : [];

      res.status(201).json({
        status: 'success',
        message: '留言新增成功',
        data: comment
      });

    } catch (err) {
      await connection.rollback();
      console.error('交易過程發生錯誤：', err);
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error('新增留言錯誤：', err);
    res.status(500).json({
      status: 'error',
      message: err.message || '新增留言失敗'
    });
  }
});

router.post('/comments', upload.single('media'), async (req, res) => {
  try {
    let { content, articleId, userId, parentId } = req.body;
    // 假設 GIF URL 透過 gifUrl 欄位傳送
    const gifUrl = req.body.gifUrl || '';

    // 若 content 為 null 或 undefined，預設為空字串
    content = content || '';

    // 檢查邏輯：如果留言內容空白，同時沒有上傳檔案／GIF，就回傳錯誤
    if (content.trim() === '' && !req.file && !gifUrl.trim()) {
      return res.status(400).json({ message: "請輸入留言內容或附上檔案/GIF" });
    }

    // 若 content 為空但有檔案或 GIF，則可存空字串或預設文字（依需求決定）
    const finalContent = content.trim();

    // 使用上傳的檔案或 GIF URL 作為留言的 media_url
    const mediaUrl = req.file ? req.file.path : gifUrl;

    // 儲存留言邏輯
    const [result] = await pool.query(
      `INSERT INTO comments (article_id, user_id, parent_id, content, media_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [articleId, userId, parentId, finalContent, mediaUrl]
    );

    return res.json({ message: "留言新增成功", commentId: result.insertId });
  } catch (err) {
    console.error('新增留言錯誤:', err);
    return res.status(500).json({ message: err.message });
  }
});


router.put('/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: '留言內容不能為空'
    });
  }

  try {
    // 檢查留言是否存在
    const [comment] = await pool.query(
      'SELECT * FROM article_comments WHERE id = ? AND is_deleted = 0',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到此留言'
      });
    }

    // 更新留言內容
    await pool.query(
      'UPDATE article_comments SET content = ?, updated_at = NOW() WHERE id = ?',
      [content, commentId]
    );

    // 獲取更新後的時間
    const [updatedComment] = await pool.query(
      'SELECT updated_at FROM article_comments WHERE id = ?',
      [commentId]
    );

    return res.json({
      success: true,
      message: '留言更新成功',
      updatedTime: updatedComment[0].updated_at
    });
  } catch (err) {
    console.error('更新留言失敗:', err);
    return res.status(500).json({
      success: false,
      message: err.message || '更新留言失敗'
    });
  }
});

// 處理留言刪除
router.delete('/:commentId', async (req, res) => {
  const { commentId } = req.params;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. 將留言標記為已刪除
      await connection.query(
        'UPDATE article_comments SET is_deleted = 1 WHERE id = ?',
        [commentId]
      );

      // 2. 將相關的媒體檔案標記為已刪除
      await connection.query(
        'UPDATE comments_media SET is_deleted = 1 WHERE comment_id = ?',
        [commentId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: '留言刪除成功'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('刪除留言失敗:', err);
    return res.status(500).json({
      success: false,
      message: err.message || '刪除留言失敗'
    });
  }
});


export default router
