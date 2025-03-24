'use client'

import styles from './four-info.module.scss'
import StarRating from '../../../_components/star-rating/page'
import Link from 'next/link'

export default function FourInfo({ course }) {

  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <>
      <div className={styles['four-course-info-container']}>
        <div className="container">
          <div className={styles['four-course-info-wrapper']}>
            <div className={styles['four-course-info']}>
              <div className={styles['info-content']}>
                <div className={styles['title-text']}>課程內容</div>
                <div className={styles['content-text']}>{course.chapter|| "0 章 0 單元"}</div>
              </div>
              <div className={styles['line']}></div>
              <div className={styles['info-content']}>
                <div className={styles['title-text']}>課程時長</div>
                <div className={styles['content-text']}>
                  {Math.floor(course.duration / 60)} 時 {course.duration % 60}{' '}
                  分鐘
                </div>
              </div>
              <div className={styles['line']}></div>
              <div className={styles['info-content']}>
                <div className={styles['title-text']}>學員人數</div>
                <div className={styles['content-text']}>
                  {course.student_count.toLocaleString('en-US')}
                </div>
              </div>
              <div className={styles['line']}></div>
              <div className={styles['info-content']}>
              <a
              href="#"
              // className={styles['course-info-teacher']}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('course-rating')
              }}
            >
                <div className={styles['title-text']}>
                  {course.comment_count.toLocaleString('en-US')} 則評價
                </div>
                <div className={styles['rating']}>
                <p>{parseFloat(course.rating || 0).toFixed(1)}</p>
                  <StarRating rating={course.rating || 0} />
                </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
