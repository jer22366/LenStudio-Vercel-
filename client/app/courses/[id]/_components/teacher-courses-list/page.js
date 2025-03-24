'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '@/styles/globals.css'
import styles from './teacher-courses-list.module.scss'
import StarRating from '@/app/courses/_components/star-rating/page'
import FavoriteButton from '@/app/courses/_components/favorite-button/page'

export default function TeacherCoursesList({ courses }) {
  // 確保 `courses` 存在，避免 undefined
  const teacherCourses = courses || []

  // Debug: 確認 `courses` 是否正確傳遞
  useEffect(() => {
    // console.log('📌 TeacherCoursesList 取得的 courses:', teacherCourses)
  }, [teacherCourses])

  return (
    <div className={styles['container']} id="teacher-courses">
      <div className={styles['section-detail-title']}>
        <div className={styles['title-block']}></div>
        <h2>講師的所有課程</h2>
      </div>

      <div className="row mt-4">
        {teacherCourses.length > 0 ? (
          teacherCourses.map((teacherCourse) => (
            <div
              key={teacherCourse.id}
              className="col-12 col-xl-6"
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
            >
              <Link
                href={`/courses/${teacherCourse.id}`}
                className={styles['course-card-link']}
              >
                <div className={`${styles['course-card']} mb-4 mb-md-5`}>
                  {/* 課程圖片 + 收藏按鈕 */}
                  <div className="e-card-img">
                    <img
                      src={
                        teacherCourse.image_url || '/images/default-course.jpg'
                      }
                      alt={teacherCourse.title || '課程圖片'}
                      className="img-fluid"
                    />
                    <div className="e-img-overlay"></div>
                    <FavoriteButton courseId={teacherCourse.id} />
                  </div>

                  {/* 課程標題 & 講師名稱 */}
                  <h3 className={styles['course-title']}>
                    {teacherCourse.title || '未命名課程'}
                  </h3>

                  {/* 評分 & 學生數量 */}
                  <div className={styles['rating-student']}>
                    <div className={styles['rating']}>
                      <p>{parseFloat(teacherCourse.rating || 0).toFixed(1)}</p>
                      <StarRating rating={teacherCourse.rating || 0} />
                    </div>
                    <div className={styles['student-count']}>
                      <img
                        src="/images/icon/student-count.svg"
                        alt="學生數量"
                      />
                      <div className={styles['student-num']}>
                        {teacherCourse.student_count
                          ? teacherCourse.student_count.toLocaleString()
                          : '0'}
                      </div>
                    </div>
                  </div>

                  {/* 價格 */}
                  <div className={styles['course-price']}>
                    <p>
                      NT${' '}
                      {teacherCourse.sale_price !== undefined
                        ? teacherCourse.sale_price.toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p>這位講師目前沒有課程</p>
        )}
      </div>
    </div>
  )
}
