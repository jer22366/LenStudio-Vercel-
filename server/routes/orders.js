import express, { Router } from 'express'
import cors from 'cors'
import pool from '../db.js'

const router = express.Router()

//cors設定
const corsOptions = {
  origin: ['http://localhost:3000','https://lenstudio.vercel.app/'], // 允許來自 http://localhost:3000 的請求
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
};

router.use(cors(corsOptions)); // 使用 cors 中間件


router.post("/", async (req, res) => {
  const { cartItems, buyerData, userId, merchantTradeNo, disMoney, selectedCoupons } = req.body;

  // 檢查 cartItems, buyerData 是否為有效物件
  if (!cartItems || typeof cartItems !== "object") {
    return res.status(400).json({ success: false, message: "無效的 cartItems" });
  }
  if (!buyerData || typeof buyerData !== "object") {
    return res.status(400).json({ success: false, message: "無效的 buyerData" });
  }

  try {
    let totalPrice = 0;
    Object.values(cartItems).forEach(cartItem => {
      totalPrice += cartItem.price;
    });

    await pool.execute(
      `INSERT INTO orders (order_code, user_id, name, address, total, discount_money, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [merchantTradeNo, userId, buyerData.name, buyerData.address, totalPrice, disMoney, buyerData.phone]
    );

    if (selectedCoupons && typeof selectedCoupons === "object" && Object.keys(selectedCoupons).length > 0) {
      await Promise.all(Object.values(selectedCoupons).map(async (coupon) => {
        await pool.execute(`DELETE FROM user_coupon WHERE id = ?`, [coupon.code]);
      }));
    }

    const [orderId] = await pool.execute(
      `SELECT id FROM orders WHERE order_code = ? LIMIT 1`, [merchantTradeNo]
    );
    
    await Promise.all(Object.values(cartItems).map(async (cartItem) => {
      let categoryId = null, coursesId = null, rentalId = null;
      const model = cartItem.model || cartItem.name;
      let start_date, end_date;

      switch (cartItem.type) {
        case 'product':
          categoryId = cartItem.product_id;
          break;
        case 'lession':
          coursesId = cartItem.product_id;
          break;
        case 'rent':
          rentalId = cartItem.product_id;
          start_date = cartItem.start;
          end_date = cartItem.end;
          break;
      }

      if (categoryId !== null) {
        await pool.execute(
          `INSERT INTO user_product (order_id, user_id, name, product_id) VALUES (?, ?, ?, ?)`,
          [orderId[0].id, userId, model, categoryId]
        );
      } else if (coursesId !== null) {
        await pool.execute(
          `INSERT INTO user_courses (order_id, user_id, name, courses_id) VALUES (?, ?, ?, ?)`,
          [orderId[0].id, userId, model, coursesId]
        );
      } else if (rentalId !== null) {
        let price = cartItem.price;
        await pool.execute(
          `INSERT INTO user_rentals (order_id, user_id, rent_id, rent_fee, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId[0].id, userId, rentalId, price, start_date, end_date]
        );
      }
    }));

    res.status(200).json({ success: true, message: "訂單儲存成功" });

  } catch (error) {
    console.error("訂單儲存失敗:", error);
    res.status(500).json({ success: false, message: "訂單儲存失敗", error });
  }
});

export default router