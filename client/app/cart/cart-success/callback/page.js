'use client'

import { useSearchParams } from 'next/navigation'
import { isDev } from '@/config'
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./cart-success.scss";
import { CheckCircle } from "react-bootstrap-icons";
import { jwtDecode } from "jwt-decode";

export default function ECPayCallback() {
  // 取得網址參數，例如: ?RtnCode=xxxxxx
  const searchParams = useSearchParams();
  const [orderSaved, setOrderSaved] = useState(false); // 確認訂單是否存入
  const [decoded, setDecoded] = useState(null);

  useEffect(() => {
    // 只在瀏覽器端執行的地方
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("loginWithToken");
      if (token) {
        setDecoded(jwtDecode(token)); // 設定解碼的 JWT 資料
      }
    }
  }, []);

  useEffect(() => {
    if (decoded) {
      const saveOrderToDB = async () => {
        try {
          // 取得網址參數
          const orderData = {
            merchantTradeNo: searchParams?.get('MerchantTradeNo'),
            buyerData: JSON.parse(localStorage.getItem('buyerData') || '[]'), // 取得買家資料
            cartItems: JSON.parse(localStorage.getItem('cartItems') || '[]'), // 取得購物車資料
            date: searchParams?.get('PaymentDate'),
            userId: decoded.id,
            disMoney: JSON.parse(localStorage.getItem("discountMoney")) || 0,
            selectedCoupons: JSON.parse(localStorage.getItem("selectedCoupons") || '[]')
          };

          console.log("送出訂單資料:", orderData);

          const response = await fetch('https://lenstudio.onrender.com/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          if (response.status == 200) {
            setOrderSaved(true);
            console.log('訂單已成功存入資料庫');
            //清除 localStorage 中的資料
            localStorage.removeItem('cart');
            localStorage.removeItem('rent_cart');
            localStorage.removeItem('shoppingCart');
            localStorage.removeItem('cartItems');
            localStorage.removeItem('buyerData');
            localStorage.removeItem('discountMoney');
            localStorage.removeItem('selectedCoupons');
          } else {
            console.error('存入失敗:', await response.text());
          }
        } catch (error) {
          console.error('存入訂單時發生錯誤:', error);
        }
      };
      saveOrderToDB();
      const timer = setTimeout(() => {
        window.location.href = "/"; // 替換成你的目標頁面 URL
      }, 3000);

      // return () => clearTimeout(timer); // 清除計時器，避免潛在錯誤
    }
  }, [decoded, searchParams]);

  if (isDev) console.log('RtnCode', searchParams?.get('RtnCode'))

  return (
    <>
      {/* <p>以下為回傳資料:</p>
      <p>交易編號: {searchParams?.get('MerchantTradeNo')}</p>
      <p>交易金額: {searchParams?.get('TradeAmt')}</p>
      <p>交易日期: {searchParams?.get('TradeDate')}</p>
      <p>付款日期: {searchParams?.get('PaymentDate')}</p>
      <p>付款方式: {searchParams?.get('PaymentType')}</p>
      <p>回應碼: {searchParams?.get('RtnCode')}</p>
      <p>回應訊息: {searchParams?.get('RtnMsg')}</p> */}
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="container text-center p-4">
          <div className="d-none d-sm-flex align-items-center justify-content-center mb-3">
            <CheckCircle className="text-success me-5" size={100} />
            <div>
              <h2>謝謝你! 你的訂單已成立</h2>
              <p className="fw-bold">訂單號碼: {searchParams?.get('MerchantTradeNo')}</p>
              <br />
              <p>交易金額: {searchParams?.get('TradeAmt')}元</p>
              <p>交易日期: {searchParams?.get('TradeDate')}</p>
              <p>付款日期: {searchParams?.get('PaymentDate')}</p>
              <span>訂單確認電郵已發到您的電子郵箱:</span>
              <p className="fw-bold">{decoded?.mail}</p>
            </div>
          </div>
          <div className="d-flex d-sm-none d-block align-items-center justify-content-center mb-3 flex-column">
            <CheckCircle className="text-success mb-3" size={100} />
            <div>
              <h2>謝謝你! 你的訂單已成立</h2>
              <p className="fw-bold">訂單號碼: {searchParams?.get('MerchantTradeNo')}</p>
              <br />
              <p>交易金額: {searchParams?.get('TradeAmt')}元</p>
              <p>交易日期: {searchParams?.get('TradeDate')}</p>
              <p>付款日期: {searchParams?.get('PaymentDate')}</p>
              <span>訂單確認電郵已發到您的電子郵箱:</span>
              <p className="fw-bold">{decoded?.mail}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
