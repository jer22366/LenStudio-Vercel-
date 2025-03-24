'use client'

import styles from './teacher-info-modal.module.scss'
import { FaGlobe, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa'
import TeacherCoursesList from '../../[id]/_components/teacher-courses-list/page'
import 'hover.css'
import Link from "next/link";

export default function TeacherInfoModal({ teacher, onClose }) {
  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div
        className={styles['modal-content']}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`${styles['close-btn']} hvr-grow-rotate`}
          onClick={onClose}
        >
          ✖
        </button>

        <div className={styles['modal-body']}>
          {/* 左側：講師頭像 + 社群連結 */}
          <div className={styles['modal-left-container']}>
            <div className={styles['modal-left']}>
              <div className={styles['modal-left-img']}>
                <img
                  src={teacher.image || '/images/teacher/default.avif'}
                  alt={teacher.name}
                  className={styles['modal-img']}
                />
              </div>
              <h2 className={styles['teacher-name']}>{teacher.name}</h2>

              <div className={styles['social-links']}>
                {teacher.website && (
                  <a
                    href={teacher.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGlobe className="hvr-icon" />
                  </a>
                )}
                {teacher.facebook && (
                  <a
                    href={teacher.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook />
                  </a>
                )}
                {teacher.instagram && (
                  <a
                    href={teacher.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                  </a>
                )}
                {teacher.youtube && (
                  <a
                    href={teacher.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube />
                  </a>
                )}
              </div>
              <hr />
            </div>
            <ul className={styles['modal-teacher-data']}>
              <li className={styles['data-item']}>
                <img src="/images/icon/course-icon-w.svg" alt="" />
                <p>
                  {teacher.courseCount?.toLocaleString('en-US') || '0'} 堂課程
                </p>
              </li>
              <li className={styles['data-item']}>
                <Link href={`/article?user_id=${teacher.user_id}&author_name=${encodeURIComponent(teacher.author_name)}`} className={styles['link-wrapper']}>
                  <img src="/images/icon/article-icon-w.svg" alt="" />
                  <p>{teacher.articleCount?.toLocaleString() || "0"} 篇文章</p>
                </Link>
              </li>
              <li className={styles['data-item']}>
                <img src="/images/icon/student-icon-w.svg" alt="" />
                <p>
                  {Number(teacher.studentCount)?.toLocaleString('en-US') || '0'}{' '}
                  位學生
                </p>
              </li>
            </ul>
          </div>

          {/* 右側：簡介 + 課程 */}
          <div className={styles['modal-right']}>
            <p>{teacher.bio}</p>
            <hr className={styles['hr-line']} />
            <TeacherCoursesList courses={teacher.courses || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
