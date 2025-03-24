'use client'

import React from 'react'
import style from './index.module.scss'
import Link from 'next/link'

export default function BreadcrumbDetail({
  categoryName,
  category_id,
  articleTitle,
}) {
  return (
    <div className={`text-sm text-gray-500 ${style['y-breadcrumb']}`}>
      <Link href="/" className="text-decoration-none hover:text-gray-700">
        首頁
      </Link>
      <span className="mx-2">&gt;</span>
      <Link
        href="/article"
        className="text-decoration-none hover:text-gray-700"
      >
        最新消息
      </Link>
      <span className="mx-2">&gt;</span>
      <Link
        href={`/article?category=${category_id}`}
        className="text-decoration-none hover:text-gray-700"
      >
        {categoryName || '未分類'}
      </Link>
      <span className="mx-2">&gt;</span>
      <p className="text-gray-500 inline">{articleTitle || '載入中...'}</p>
    </div>
  )
}
