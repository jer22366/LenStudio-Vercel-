import express from 'express';
import cors from 'cors';
import pool from '../db.js';

const router = express.Router();

const corsOptions = {
    origin: ['http://localhost:3000','https://lenstudio.vercel.app/'],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
};

router.use(cors(corsOptions));

// **檢查優惠券是否達到數量限制**
router.post("/check", async (req, res) => {
    const { userId, couponId } = req.body;
    try {
        const [result] = await pool.execute(
            `SELECT COUNT(uc.quantity) AS amount 
             FROM user_coupon uc 
             INNER JOIN coupon c ON uc.coupon_id = c.id 
             WHERE user_id = ? AND coupon_id = ?`,
            [userId, couponId]
        );

        const amount = result[0].amount || 0;
        const maxLimit = 1; // 假設每種優惠券最多可以領取 1 張

        res.status(200).json({ 
            success: true, 
            reachedLimit: amount >= maxLimit, 
            message: amount >= maxLimit ? "已達優惠券領取限制" : "可以領取" 
        });
    } catch (error) {
        console.error("優惠券獲取失敗:", error);
        res.status(500).json({ success: false, message: "優惠券獲取失敗", error });
    }
});

// **領取優惠券**
router.post("/", async (req, res) => {
    const { userId, quantity, couponId } = req.body;
    try {
        // 檢查當前用戶已領取的數量
        const [checkResult] = await pool.execute(
            `SELECT COUNT(uc.quantity) as amount 
             FROM user_coupon uc 
             WHERE user_id = ? AND coupon_id = ?;`,
            [userId, couponId]
        );

        const amount = checkResult[0]?.amount || 0;
        if (amount >= 1) {
            return res.status(200).json({ success: false, message: "您已達優惠券領取上限" });
        }

        // 插入資料
        const [insertResult] = await pool.execute(
            `INSERT INTO user_coupon (user_id, coupon_id, quantity) VALUES (?, ?, ?);`,
            [userId, couponId, quantity]
        );
        await pool.execute(
            `UPDATE coupon SET quantity = quantity - ? WHERE id = ?;`,
            [quantity, couponId]
        );
        
        return res.status(200).json({ success: true, message: "優惠券獲取成功", result: insertResult });
    } catch (error) {
        console.error("優惠券獲取失敗:", error);
        return res.status(200).json({ success: false, message: "優惠券獲取失敗", error });
    }
});

export default router;
