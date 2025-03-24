import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();


// ✅ 自訂身份驗證函數 (取代 authenticate.js)
const authenticateUser = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("❌ 未提供 Token");
      return null;
    }

    const token = authHeader.split(" ")[1]; // 取得 Token
    if (!token) {
      console.log("❌ Token 格式錯誤");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("✅ Token 解析成功，使用者 ID:", decoded.id);
    return decoded.id; // 回傳解析出的 `userId`
  } catch (error) {
    console.error("❌ Token 解析失敗:", error);
    return null;
  }
};

/**
 * ✅ 檢查使用者是否已收藏 (產品 / 課程 / 文章 / 租賃)
 * @route GET /api/collect/:type/collection/:id
 */
router.get("/:type/collection/:id", async (req, res) => {
  try {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "未授權，請提供有效 Token" });
    }

    const { type, id } = req.params;

    console.log(`🛠 檢查收藏 - 使用者ID: ${userId}, 類型: ${type}, 內容ID: ${id}`);

    const validTypes = ["product", "course", "article", "rent"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "類型不合法，請提供有效類型" });
    }

    const [result] = await pool.query(
      `SELECT id FROM collection WHERE user_id = ? AND ${type}_id = ?`,
      [userId, id]
    );

    res.json({ isFavorite: result.length > 0 });
  } catch (error) {
    console.error("❌ 檢查收藏狀態失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

/**
 * ✅ 新增收藏 (產品 / 課程 / 文章 / 租賃)
 * @route POST /api/collect/:type/collection/me
 */
router.post("/:type/collection/me", async (req, res) => {
  try {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "未授權，請提供有效 Token" });
    }

    const { type } = req.params;
    const { [`${type}_id`]: itemId } = req.body;

    console.log(`📌 新增收藏 - 使用者ID: ${userId}, 類型: ${type}, 內容ID: ${itemId}`);

    const validTypes = ["product", "course", "article", "rent"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "類型不合法，請提供有效類型" });
    }

    if (!itemId) {
      return res.status(400).json({ message: `${type}_id 未提供或無效` });
    }

    // ✅ 檢查是否已收藏，避免重複收藏
    const [checkExist] = await pool.query(
      `SELECT * FROM collection WHERE user_id = ? AND ${type}_id = ?`,
      [userId, itemId]
    );

    if (checkExist.length > 0) {
      return res.status(409).json({ message: "已收藏過，無需重複收藏", isFavorite: true });
    }

    // ✅ 新增收藏
    await pool.query(
      `INSERT INTO collection (user_id, ${type}_id) VALUES (?, ?)`,
      [userId, itemId]
    );

    res.json({ message: "收藏成功", isFavorite: true });
  } catch (error) {
    console.error("❌ 新增收藏失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

/**
 * ✅ 取消收藏 (產品 / 課程 / 文章 / 租賃)
 * @route DELETE /api/collect/:type/collection/:id
 */
router.delete("/:type/collection/:id", async (req, res) => {
  try {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "未授權，請提供有效 Token" });
    }

    const { type, id } = req.params;
    console.log(`❌ 取消收藏 - 使用者ID: ${userId}, 類型: ${type}, 內容ID: ${id}`);

    const validTypes = ["product", "course", "article", "rent"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "類型不合法，請提供有效類型" });
    }

    // ✅ 確保收藏存在，避免刪除不存在的項目
    const [checkExist] = await pool.query(
      `SELECT * FROM collection WHERE user_id = ? AND ${type}_id = ?`,
      [userId, id]
    );

    if (checkExist.length === 0) {
      console.log("❌ 找不到該收藏項目，無法刪除");
      return res.status(404).json({ message: "找不到該收藏項目" });
    }

    // ✅ 執行刪除
    const [deleteResult] = await pool.query(
      `DELETE FROM collection WHERE user_id = ? AND ${type}_id = ?`,
      [userId, id]
    );

    console.log(`✅ 刪除成功，影響行數: ${deleteResult.affectedRows}`);

    res.json({ message: "取消收藏成功", isFavorite: false });
  } catch (error) {
    console.error("❌ 取消收藏失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

export default router;
