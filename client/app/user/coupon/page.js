'use client';
import Link from 'next/link';
import styles from './coupon.module.scss'; // 引入 CSS Modules
import React, { useEffect, useState } from 'react';
import useAuth from '@/hooks/use-auth';
import Sidenav from '../_components/Sidenav/page';

export default function Coupon() {
  const { token, user, loading } = useAuth();
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    if (token) {
      fetchCoupons();
    }
  }, [token]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("https://lenstudio.onrender.com/api/myorders/coupon", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error("🔴 獲取優惠券失敗:", error);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">載入中...</div>;
  }

  return (
    <div className="container py-4">
      <div className={`row ${styles.marginTop}`}>
        {/* 側邊選單 */}
        <Sidenav />


        {/* 主要內容區 */}
        <div className="col-md-8 col-lg-9 py-4">
          <h1 className={`mb-4 ${styles.h1}`}>我的優惠券</h1>

          {/* 相機 & 課程分類 */}
          {[
            { id: 1, label: "相機優惠券" },
            { id: 2, label: "課程優惠券" },
          ].map(({ id, label }) => {
            const filteredCoupons = coupons.filter((coupon) => coupon.coupon_id === id);

            if (filteredCoupons.length === 0) return null;

            return (
              <div key={id}>
                <h5 className="mt-4">{label}</h5>
                <div className="row">
                  {filteredCoupons.map((coupon) =>
                    Array.from({ length: coupon.quantity }).map((_, index) => {
                      // 計算優惠券過期時間 (created_at + 5 天)
                      const createdAt = new Date(coupon.created_at.replace(" ", "T")); // 修正格式
                      const expiryDate = new Date(createdAt);
                      expiryDate.setDate(expiryDate.getDate() + 5);
                      const formattedExpiryDate = expiryDate.toISOString().split("T")[0];


                      return (
                        <div key={`${coupon.coupon_id}-${index}`} className="col-md-6 col-lg-5 d-flex justify-content-center">
                          <div className={`${styles.couponCard} position-relative`}>
                            <img src={`/images/cart/${coupon.coupon_image}`} alt="優惠券" className="img-fluid" />
                            <span className={`position-absolute ${styles.JcpEndDate}`}>
                              使用期日: {formattedExpiryDate}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}