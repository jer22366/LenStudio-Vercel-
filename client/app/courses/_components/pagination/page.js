'use client'

import React from 'react'
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from 'react-icons/fa6'
import styles from './pagination.module.scss'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // 產生顯示的頁碼
  const generatePageNumbers = () => {
    const pages = []

    if (totalPages <= 5) {
      // 1️⃣ 如果總頁數 ≤ 5，顯示所有頁碼
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 2️⃣ 總頁數 > 5
      if (currentPage <= 3) {
        // 當前頁碼靠近開頭，顯示 [1, 2, 3, 4, 5]
        pages.push(1, 2, 3, 4, 5)
      } else if (currentPage >= totalPages - 2) {
        // 當前頁碼靠近結尾，顯示 [總頁數-4, 總頁數-3, 總頁數-2, 總頁數-1, 總頁數]
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        // 當前頁碼在中間，顯示 [當前頁碼-2, 當前頁碼-1, 當前頁碼, 當前頁碼+1, 當前頁碼+2]
        pages.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2
        )
      }
    }

    return pages
  }

 
  

  return (
    <section className={styles['pages-container']} >
      {/* 最前頁按鈕 */}
      {totalPages > 5 && (
        <button
          className={`${styles['page-arrow']} ${styles['hvr-icon-back']} ${styles['e-button']}`}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <FaAnglesLeft size={15} />
        </button>
      )}

      {/* 上一頁按鈕 */}
      <button
        className={`${styles['page-arrow']} ${styles['hvr-icon-back']} ${styles['e-button']}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaAngleLeft size={15} />
      </button>

      {/* 頁數列表 */}
      <ul className={styles['pages']}>
        {generatePageNumbers().map((page) => (
          <li
            key={page}
            className={`${styles['page']} ${
              currentPage === page ? styles['active'] : ''
            }`}
            onClick={() => onPageChange(page)}
          >
            <button className={styles['page-link']}>{page}</button>
          </li>
        ))}
      </ul>

      {/* 下一頁按鈕 */}
      <button
        className={`${styles['page-arrow']} ${styles['hvr-icon-forward']} ${styles['e-button']}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FaAngleRight size={15} />
      </button>

      {/* 最後頁按鈕 */}
      {totalPages > 5 && (
        <button
          className={`${styles['page-arrow']} ${styles['hvr-icon-forward']} ${styles['e-button']}`}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <FaAnglesRight size={15} />
        </button>
      )}
    </section>
  )
}
