'use client'

import React, { useState, useEffect } from 'react'
import styles from './popular-teacher.module.scss'
import { FaArrowRight } from 'react-icons/fa6'
import TeacherInfoModal from '../teacher-info-modal/page'
import "hover.css"

export default function PopularTeacher() {
  const [topTeachers, setTopTeachers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('https://lenstudio.onrender.com/api/teachers') // 🚀 請求老師 API
        if (!res.ok) throw new Error('無法獲取講師資料')

        const data = await res.json()
        // console.log('📌 取得的講師資料:', data) 

        setTopTeachers(data.slice(0, 4)) // 取前 4 名
      } catch (error) {
        // console.error('❌ 無法獲取熱門講師:', error)
      }
    }

    fetchTeachers()
  }, [])

  // 📌 點擊講師圖片時，請求該講師詳細資料 ，並顯示彈跳視窗
  const handleTeacherClick = async (teacherId) => {
    if (isMobile) {
      // ✅ 手機版：跳轉到獨立頁面
      window.location.href = `/courses/teacher/${teacherId}`;
    } else {
      // ✅ 桌機版：開啟彈出視窗
      try {
        const res = await fetch(`/api/teachers/${teacherId}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        // console.log("📌 選擇的講師資料:", data);
        setSelectedTeacher(data);
        setIsModalOpen(true);
      } catch (error) {
        // console.error("❌ 獲取講師資料失敗:", error);
      }
    }
  };


  // 576px 移除 container
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';  // 禁止背景滾動
    } else {
      document.body.style.overflow = 'auto';  // 允許滾動
    }
    return () => {
      document.body.style.overflow = 'auto';  // 彈出視窗關閉時恢復滾動
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 576);
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // ✅ 先執行一次，確保初始狀態正確
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <section className={styles['popular-teacher']} id="teacher-info">
      <div className={isSmallScreen ? "w-100" : "container"}>
        <div className={styles['teacher-title']} data-aos="fade-right">
          <div className={styles['title-block']}></div>
          <h2>熱門講師</h2>
        </div>

        <div className={styles['teacher-wrapper']}>
          <div className={`row flex-nowrap mt-4 mt-lg-5 ${styles['teacher-list']}`} id="course-list">
            {topTeachers.map((teacher, index) => (
              <div
                key={teacher.teacher_id} // ✅ 確保 `key` 唯一
                className="col-md-3"
                data-aos="fade-up"
                data-aos-duration={1000 + index * 500} // 動畫延遲
              >
                <a onClick={() => handleTeacherClick(teacher.teacher_id)} className={styles["teacher-card-btn"]}>
                  <div className={`${styles['teacher-card']} hvr-grow`}>
                    <div className={styles['teacher-card-img']}>
                      <img src={teacher.teacher_image} alt={teacher.teacher_name} />
                      <div className={styles['teacher-card-overlay']}></div>
                      <div className={styles['arrow-more']}>
                        <div className={styles['circle-more']}>
                          <FaArrowRight style={{ transform: 'rotate(-45deg)' }} />
                        </div>
                      </div>
                      <h3>{teacher.teacher_name}</h3>
                      <p>{teacher.teacher_bio || '這位講師暫無簡介'}</p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 引入彈跳視窗組件 */}
      {isModalOpen && selectedTeacher && (
        <TeacherInfoModal
          teacher={selectedTeacher}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}
