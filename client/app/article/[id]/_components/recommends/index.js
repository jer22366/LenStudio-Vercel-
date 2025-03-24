'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './index.module.scss';
import StarRating from '@/app/courses/_components/star-rating/page.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

// 從資料庫取得推薦課程
function ProductCard({ course }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [token, setToken] = useState(null);
  const safeImage = course.image_url || '/images/default-course.jpg';

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // 讀取 token
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('loginWithToken');
      setToken(storedToken);

      // 如果有 token，檢查課程收藏狀態
      if (storedToken && course.id) {
        checkFavoriteStatus(storedToken, course.id);
      }
    }
  }, [course.id]);

  // 檢查收藏狀態
  const checkFavoriteStatus = async (token, courseId) => {
    try {
      const res = await fetch(
        `https://lenstudio.onrender.com/api/courses/collection/${courseId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error('無法取得收藏狀態');

      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('❌ 無法確認收藏狀態:', error);
    }
  };

  // 收藏或取消收藏
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.warn('請先登入，即可收藏課程！', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      let url = 'https://lenstudio.onrender.com/api/courses/collection';

      if (method === 'DELETE') {
        url = `https://lenstudio.onrender.com/api/courses/collection/${course.id}`;
      }

      console.log('📌 送出的請求:', method, url);

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body:
          method === 'POST' ? JSON.stringify({ course_id: course.id }) : null,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? '已取消收藏！' : '成功加入收藏！', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('收藏錯誤:', error);
      toast.error('操作失敗：' + (error.message || '發生錯誤，請稍後再試'), {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="col-lg-3 col-sm-6 col-12" data-aos="fade-up">
      <Link href={`/courses/${course.id}`} className={styles['course-card-link']}>
        <div className={`${styles['course-card']} mb-md-5 mb-4`}>
          <div className={styles['card-img']} data-aos="fade-in">
            <img
              src={safeImage}
              alt={course.title}
              className="img-fluid"
              loading="lazy"
            />
            <div className={styles['img-overlay']}></div>
            <button
              className={styles['favorite-icon']}
              onClick={handleFavoriteClick}
            >
              {isFavorite ? (
                <FaHeart size={18} style={{ color: 'var(--secondary-color)' }} />
              ) : (
                <FaRegHeart size={18} style={{ color: 'var(--secondary-color)' }} />
              )}
            </button>
          </div>
          <div className="card-body p-0 mt-3">
            <h6 className={styles['teacher-name']}>{course.teacher_name}</h6>
            <h5 className={styles['course-title']}>{course.title}</h5>
            <div className={styles['rating-student']}>
              <div className={styles['rating']}>
                <p>{parseFloat(course.rating || 0).toFixed(1)}</p>
                <StarRating rating={course.rating || 0} />
              </div>
              <div className={styles['student-count']}>
                <img src="/images/icon/student-count.svg" alt="學生數量" />
                <div className={styles['student-num']}>
                  {course.student_count ? course.student_count.toLocaleString('en-US') : '0'}
                </div>
              </div>
            </div>
            <h6 className={styles['course-price']}>
              <p>NT$ {course.sale_price ? course.sale_price.toLocaleString('en-US') : 'N/A'}</p>
            </h6>
          </div>
        </div>
      </Link>
    </div>
  );
}

// 主元件
export default function Recommends() {
  const [recommendCourses, setRecommendCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendCourses = async () => {
    try {
      console.log('正在獲取推薦課程...');
      const response = await fetch('/api/courses/recommend');
      console.log('推薦課程 API 響應狀態:', response.status);

      if (!response.ok) {
        console.warn(`API 返回錯誤: ${response.status}`);
        return [];
      }

      const data = await response.json();
      console.log('獲取到的課程數據:', data ? data.length : 'none');
      return data || [];
    } catch (error) {
      console.error('獲取推薦課程失敗:', error);
      return []; // 出錯時返回空數組
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const courses = await fetchRecommendCourses();
        setRecommendCourses(courses);
      } catch (error) {
        console.error('載入推薦課程時出錯:', error);
        setRecommendCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className={styles['y-recommends-area-bg']}>
      <div className={`my-5 ${styles['y-recommends-area']}`}>
        <h2 className="px-4">Lenstudio Recommends</h2>
        <div className={styles['y-recommends-line']}></div>

        {/* 網格布局 - 大螢幕 */}
        <div className={`row px-4 ${styles['grid-view']}`}>
          {recommendCourses.map((course) => (
            <ProductCard key={course.id} course={course} />
          ))}
        </div>

        {/* 滑動布局 - 小螢幕 */}
        <div className={`px-4 ${styles['scroll-view']}`}>
          <div className={styles['scroll-container']}>
            {recommendCourses.map((course) => (
              <div key={course.id} className={styles['card-item']}>
                <ProductCardScroll course={course} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 滑動版卡片組件
function ProductCardScroll({ course }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [token, setToken] = useState(null);
  const safeImage = course.image_url || '/images/default-course.jpg';

  // 保留原有的所有功能（獲取token、檢查收藏狀態、收藏功能等）
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('loginWithToken');
      setToken(storedToken);

      if (storedToken && course.id) {
        checkFavoriteStatus(storedToken, course.id);
      }
    }
  }, [course.id]);

  // 檢查收藏狀態
  const checkFavoriteStatus = async (token, courseId) => {
    try {
      const res = await fetch(
        `https://lenstudio.onrender.com/api/courses/collection/${courseId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error('無法取得收藏狀態');

      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('❌ 無法確認收藏狀態:', error);
    }
  };

  // 收藏或取消收藏
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.warn('請先登入，即可收藏課程！', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      let url = 'https://lenstudio.onrender.com/api/courses/collection';

      if (method === 'DELETE') {
        url = `https://lenstudio.onrender.com/api/courses/collection/${course.id}`;
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body:
          method === 'POST' ? JSON.stringify({ course_id: course.id }) : null,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? '已取消收藏！' : '成功加入收藏！', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('收藏錯誤:', error);
      toast.error('操作失敗：' + (error.message || '發生錯誤，請稍後再試'), {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <Link href={`/courses/${course.id}`} className={styles['course-card-link']}>
      <div className={`${styles['course-card']} mb-md-5 mb-4`}>
        <div className={styles['card-img']} data-aos="fade-in">
          <img
            src={safeImage}
            alt={course.title}
            className="img-fluid"
            loading="lazy"
          />
          <div className={styles['img-overlay']}></div>
          <button
            className={styles['favorite-icon']}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? (
              <FaHeart size={18} style={{ color: 'var(--secondary-color)' }} />
            ) : (
              <FaRegHeart size={18} style={{ color: 'var(--secondary-color)' }} />
            )}
          </button>
        </div>
        <div className="card-body p-0 mt-3">
          <h6 className={styles['teacher-name']}>{course.teacher_name}</h6>
          <h5 className={styles['course-title']}>{course.title}</h5>
          <div className={styles['rating-student']}>
            <div className={styles['rating']}>
              <p>{parseFloat(course.rating || 0).toFixed(1)}</p>
              <StarRating rating={course.rating || 0} />
            </div>
            <div className={styles['student-count']}>
              <img src="/images/icon/student-count.svg" alt="學生數量" />
              <div className={styles['student-num']}>
                {course.student_count ? course.student_count.toLocaleString('en-US') : '0'}
              </div>
            </div>
          </div>
          <h6 className={styles['course-price']}>
            <p>NT$ {course.sale_price ? course.sale_price.toLocaleString('en-US') : 'N/A'}</p>
          </h6>
        </div>
      </div>
    </Link>
  );
}