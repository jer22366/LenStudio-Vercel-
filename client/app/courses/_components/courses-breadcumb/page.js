'use client'

import styles from './courses-breadcrumb.module.scss'

export default function CoursesBreadcumb({ selectedCategory }) {
  return (
    <section className={`container ${styles['course-list']}`}>
      <nav className={`mt-5 ${styles.breadcrumb}`}>
        <ul className={styles.breadcrumb}>
          <li className={styles['e-breadcrumb-item']}>
            <a href="/">首頁</a>
          </li>
          <li>
            <img src="/images/icon/breadcrumb-arrow.svg" alt="" />
          </li>
          <li className={styles['e-breadcrumb-item']}>
            <a href="/courses">影像學院</a>
          </li>
          <li>
            <img src="/images/icon/breadcrumb-arrow.svg" alt="" />
          </li>
          <li className={styles['e-breadcrumb-item-active']}>
            {selectedCategory || '所有課程'}
          </li>
        </ul>
      </nav>
    </section>
  )
}
