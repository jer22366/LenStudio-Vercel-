// course-card

import React, { useState, useEffect } from 'react';
import styles from "./CourseCard.module.scss";
import Link from 'next/link'

export default function RentCard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("loginWithToken");
    console.log("發送 API 請求，Token:", token);

    if (!token) {
      setError("未登入，請先登入後查看租賃紀錄");
      setLoading(false);
      return;
    }

    fetch("https://lenstudio.onrender.com/api/myorders/course", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        console.log("API 回應狀態碼:", response.status);
        if (response.status === 401) {
          throw new Error("未授權，請重新登入");
        }
        if (!response.ok) {
          throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("API 回應資料:", data);
        if (!data || !Array.isArray(data.courses)) {
          throw new Error("API 回應格式錯誤");
        }
        setCourses(data.courses.map(course => ({ ...course, price: course.price || null })));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching cs:", error);
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
    <div className="col-md-8 col-lg-9 py-4">
      <h1 className={`mb-4 ${styles.h1}`}>我的課程</h1>
      <div className="row g-4">
        {/* 課程卡片 1 */}
        {courses.length > 0 ? (
          courses.map((course) => (
            <div className="col-sm-6 col-lg-5" key={course.course_order_id}>
              <div className={styles.courseCard}>
                <img
                  src={course.course_image || '/images/default-course.jpg'}
                  className={styles.courseImage}
                  alt="課程圖片"
                />
                <div className="p-3">
                  <small className="text-muted">課程</small>
                  <h5 className="mt-2">旅行攝影：按下快門，用攝影書寫故事</h5>
                  <h6 className={`${styles.instructor} mt-2`}>講師: {course.instructor_name}</h6>
                </div>
              </div>
            </div>
          ))
        ) : (<div className="col-12 text-center">目前沒有課程</div>)}

      </div>
    </div>
  );
}
