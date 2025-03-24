'use client'

import React from 'react'
import styles from "./breadcrumb.module.scss";

export default function BreadcrumbIndex() {
  return (
    <div className="mt-3 mb-3">
      <nav aria-label="breadcrumb">
        <ol className={`breadcrumb ${styles.breadcrumb}`}>
          <li className={`breadcrumb-item ${styles.breadcrumbItem}`}>
            <a href="/" className={styles.breadcrumbLink}>首頁</a>
          </li>
          <li className={`breadcrumb-item active ${styles.breadcrumbItem}`} aria-current="page">
            <a href="/product" className={styles.breadcrumbLink}>產品系列</a>
          </li>
          <li className={`breadcrumb-item active ${styles.breadcrumbItem}`} aria-current="page">
            <a href="/product/spec" className={styles.breadcrumbLink}>比較列表</a>
          </li>
        </ol>
      </nav>
    </div>
  )
}
