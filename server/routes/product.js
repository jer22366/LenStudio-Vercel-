import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken"; // 確保用戶登入
import dotenv from 'dotenv';
import pool from '../db.js'

dotenv.config();

// try {
//   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//   console.log("Token 解析成功:", decoded);
// } catch (error) {
//   console.error("Token 驗證失敗:", error);
// }

const router = express.Router();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "admin",
//   password: process.env.DB_PASSWORD || "12345",
//   database: process.env.DB_DATABASE || "lenstudio",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

//cors設定
const corsOptions = {
  origin: ['http://localhost:3000','https://lenstudio.vercel.app/'], // 允許來自 http://localhost:3000 的請求
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
};

router.use(cors(corsOptions)); // 使用 cors 中間件


router.get("/", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { brand_id, category_id, subcategory_id, min_price, max_price, sort } = req.query;

    let whereClause = "WHERE 1=1";
    const queryParams = [];

    if (brand_id) {
      const brandIds = brand_id.split(",").map(id => Number(id));
      whereClause += ` AND p.brand_id IN (${brandIds.map(() => "?").join(",")})`;
      queryParams.push(...brandIds);
    }

    if (category_id) {
      const categoryIds = category_id.split(",").map(id => Number(id));
      whereClause += ` AND p.category_id IN (${categoryIds.map(() => "?").join(",")})`;
      queryParams.push(...categoryIds);
    }

    if (subcategory_id) {
      const subcategoryIds = subcategory_id.split(",").map(id => Number(id));
      whereClause += ` AND p.subcategory_id IN (${subcategoryIds.map(() => "?").join(",")})`;
      queryParams.push(...subcategoryIds);
    }

    const minPriceNum = min_price ? Number(min_price) : null;
    const maxPriceNum = max_price ? Number(max_price) : null;

    if (!isNaN(minPriceNum) && minPriceNum !== null) {
      whereClause += " AND p.price >= ?";
      queryParams.push(minPriceNum);
    }

    if (!isNaN(maxPriceNum) && maxPriceNum !== null) {
      whereClause += " AND p.price <= ?";
      queryParams.push(maxPriceNum);
    }

    let orderByClause = "ORDER BY p.id ASC";
    if (sort === "price_asc") {
      orderByClause = "ORDER BY p.price ASC";
    } else if (sort === "price_desc") {
      orderByClause = "ORDER BY p.price DESC";
    }

    const [rows] = await connection.query(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.brand_id, 
        p.category_id, 
        p.subcategory_id, 
        b.brand_name AS brand_name,
        s.camera_format, 
        s.release_date,
        s.waterproof_level,
        s.image_stabilization,  
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image_url
      FROM product p
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      LEFT JOIN spec s ON p.id = s.product_id
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      ${whereClause}
      ${orderByClause}
    `, queryParams);

    connection.release();

    res.json(rows);
  } catch (error) {
    console.error("獲取商品錯誤:", error);
    res.json({ error: "無法獲取商品", details: error.message });
  }
});

router.get("/test", async (req, res) => {
  try {
    res.json({ message: "API is working!" });
  } catch (error) {
    console.error("測試路由錯誤:", error);
    res.json({ error: "無法獲取測試資料", details: error.message });
  }
});

// 新增獲取廣告的路由
router.get("/ads", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [ads] = await connection.query(`
      SELECT 
        id, 
        product_id, 
        video_url
      FROM ads
    `);
    connection.release();
    res.json(ads);
  } catch (error) {
    console.error("獲取廣告錯誤:", error);
    res.json({ error: "無法獲取廣告", details: error.message });
  }
});

router.get("/filters", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [brand] = await connection.query(`SELECT brand_id AS id, brand_name AS name FROM brand`);
    const [category] = await connection.query(`SELECT category_id AS id, category_name AS name FROM category`);
    const [subcategory] = await connection.query(`SELECT subcategory_id AS id, name AS name FROM subcategory`);

    connection.release();

    res.json({
      brand,
      category,
      subcategory,
    });

  } catch (error) {
    console.error("獲取篩選條件錯誤:", error);
    res.json({ error: "無法獲取篩選條件", details: error.message });
  }
})

router.get("/brand", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [brand] = await connection.query(`SELECT brand_id AS id, brand_name AS name FROM brand`);

    connection.release();

    res.json(brand);
  } catch (error) {
    console.error("取得品牌時發生錯誤:", error);
    res.json({ error: "伺服器錯誤", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;

    const [rows] = await connection.query(
      `SELECT 
        p.id, 
        p.name, 
        p.short_introduce,
        p.introduce,
        p.price,
        p.brand_id,
        b.brand_name AS brand_name,  
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image_url
      FROM product p
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.json({ error: "商品未找到" });
    }

    const [images] = await connection.query(
      `SELECT CONCAT('/images/product/', image_url) AS image
       FROM image
       WHERE product_id = ?`,
      [id]
    );

    const [specs] = await connection.query(
      `SELECT 
           camera_format, 
           release_date,
           waterproof_level,
          image_stabilization,
          white_balance_settings
         FROM spec
         WHERE product_id = ?`,
      [id]
    );

    connection.release();

    res.json({
      ...rows[0],
      images: images.map((img) => img.image),
      specs: specs.length > 0 ? specs : [],
    });

  } catch (error) {
    console.error("取得商品错误:", error);
    res.json({ error: "伺服器錯誤", details: error.message });
  }
});

router.get("/related/:brand_id/:current_id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { brand_id, current_id } = req.params;

    const [products] = await connection.query(
      `SELECT 
        p.id, 
        p.name, 
        p.price, 
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image
      FROM product p
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      WHERE p.brand_id = ? AND p.id != ?
      ORDER BY p.id ASC 
      LIMIT 8`,
      [brand_id, current_id]
    );

    connection.release();
    res.json(products);
  } catch (error) {
    console.error("取得相關產品錯誤:", error);
    res.json({ error: "伺服器錯誤", details: error.message });
  }
});

router.get("/spec/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "SELECT * FROM spec WHERE product_id = ?";
    const [rows] = await connection.execute(query, [id]);

    connection.release();

    if (!rows || rows.length === 0) {
      return res.json({ error: `找不到 product_id = ${id} 的規格` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("伺服器錯誤:", error);
    res.json({ error: "伺服器錯誤，請檢查 API" });
  }
});

// 確保請求帶有 JWT Token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.error("錯誤: 缺少 Token");
    return res.json({ error: "未授權，請先登入" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    console.log("🔹 解碼後的使用者:", req.user);

    next();
  } catch (error) {
    console.error("Token 驗證失敗:", error);
    return res.json({ error: "無效的 Token" });
  }
};

router.post('/update-product-id', async (req, res) => {
  try {
    const { articleId } = req.body; // 前端傳入文章 ID
    const connection = await pool.getConnection();

    // 直接從文章中取得 product_id（假設文章已更新過）
    const [articles] = await connection.query(
      `SELECT product_id FROM article WHERE id = ? LIMIT 1`,
      [articleId]
    );

    if (articles.length === 0) {
      console.log("找不到該文章");
      connection.release();
      return res.json({ status: 'success', productId: null });
    }

    const productId = articles[0].product_id;
    console.log("取得文章 product_id:", productId);

    connection.release();
    return res.json({ status: 'success', productId });
  } catch (err) {
    console.error('更新 product_id 錯誤:', err.stack);
    return res.json({ status: 'error', message: err.message });
  }
});

// 加入收藏
router.post("/collection", authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      return res.json({ error: "缺少 product_id" });
    }

    console.log("🔹 接收到的收藏請求:", { user_id, product_id });

    const [existing] = await pool.query(
      "SELECT * FROM collection WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );

    if (existing.length > 0) {
      return res.json({ message: "此商品已收藏" });
    }

    const [result] = await pool.query(
      "INSERT INTO collection (user_id, product_id) VALUES (?, ?)",
      [user_id, product_id]
    );

    console.log("收藏成功:", result);
    res.json({ message: "成功加入收藏", data: result });
  } catch (error) {
    console.error("收藏失敗:", error);
    res.json({ error: "伺服器錯誤" });
  }
});

// 確保 DELETE 請求能夠正確刪除收藏
router.delete("/collection", authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      return res.json({ error: "缺少 product_id" });
    }

    console.log("🔹 刪除收藏請求:", { user_id, product_id });

    // 刪除收藏
    const [result] = await pool.query(
      "DELETE FROM collection WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.json({ error: "收藏記錄不存在" });
    }

    console.log("收藏刪除成功:", result);
    res.json({ message: "成功取消收藏" });

  } catch (error) {
    console.error("刪除收藏失敗:", error);
    res.json({ error: "伺服器錯誤" });
  }
});

router.get("/collection/:productId", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      "SELECT * FROM collection WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ isFavorite: result.length > 0 });
  } catch (error) {
    console.error("獲取收藏狀態失敗:", error);
    res.json({ error: "伺服器錯誤" });
  }
});

export default router;
