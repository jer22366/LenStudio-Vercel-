import express, { Router } from 'express'
import cors from 'cors'
import pool from '../db.js'

const router = express.Router()

const corsOptions = {
    origin: ['http://localhost:3000' ,'https://lenstudio.vercel.app/'], // 允許來自 http://localhost:3000 的請求
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
};

router.use(cors(corsOptions)); // 使用 cors 中間件

router.get("/", async (req, res) => {
    const userId = req.query.id
    try {
        // 插入資料
        const [result] = await pool.execute(
            `SELECT ad.address, u.name FROM addresses ad inner Join  users u on u.id = ad.user_id WHERE user_id = ?;
         `, [userId]
        );
        console.log(result);
        res.status(200).json({ success: true, message: "ˇ地址獲取成功", result });
    } catch (error) {
        console.error("地址獲取失敗:", error);
        res.json({ success: false, message: "優地址獲取失敗", error });
    }
})

export default router