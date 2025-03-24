// rent-card

import React, { useState, useEffect } from 'react';
import styles from "./RentCard.module.scss";
import RentReviews from '../rent-reviews/page';

export default function RentCard() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //日期格式化
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : "N/A";
  };

  useEffect(() => {
    const token = localStorage.getItem("loginWithToken");

    if (!token) {
      setError("未登入，請先登入後查看租賃紀錄");
      setLoading(false);
      return;
    }

    fetch("https://lenstudio.onrender.com/api/myorders/rent", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.status === 401) {
          throw new Error("未授權，請重新登入");
        }
        if (!response.ok) {
          throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setRentals(data.products.map(rental => ({ ...rental, comment_at: rental.comment_at || null })) || []);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-5">載入中...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">❌ {error}</div>;
  }

  return (
    <section className="mb-5">
      <div className="row g-3">
        {rentals.length === 0 ? (
          <div className="text-center">暫無租賃紀錄</div>
        ) : (
          rentals.map((rental) => {
            return (
              <div key={rental.rental_order_id} className="col-12 col-md-6 col-lg-4">
                <div className={`p-3 ${styles.collectionCard}`}>
                  <h6 className='d-flex justify-content-between' >
                    <div style={{ fontSize: '1.1rem' }}>
                      <span className="me-1">{rental.brand_name}</span>
                      <span>{rental.product_name}</span>
                    </div>
                    <div className={`text-end`} style={{ color: rental.status === "已完成" ? "#23425a" : "#ca6d1b" }}>
                      {rental.status}
                    </div>
                  </h6>
                  <img
                    src={rental.image_url || "/images/rental/test/Leica-Q3-0.png"}
                    className="d-block mx-auto mb-1"
                    style={{ width: '50%' }}
                    alt={rental.product_name}
                  />
                  <div className='d-flex justify-content-between align-items-end'>
                    <div>
                      <h6>租賃日期: {formatDate(rental.start_date)}</h6>
                      <h6 className={styles.maturity}>到期日期: {formatDate(rental.end_date)}</h6>
                    </div>
                    <div className=''>
                      <RentReviews key={rental.rental_order_id} reviews={[{ ...rental, id: rental.rental_order_id }]} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
