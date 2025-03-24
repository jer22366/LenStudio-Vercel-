'use client'

import React, { useState, useEffect } from 'react'
import styles from './index.module.scss'
import ContentLoader from 'react-content-loader'

const NewsCardLoader = () => {
  const numberOfLoaders = 2

  return (
    <>
      {Array.from({ length: numberOfLoaders }).map((_, index) => (
        <div key={index} style={{ marginBottom: '20px', width: '375px' }}>
          <ContentLoader
            speed={2}
            width={375}
            height={160}
            viewBox="0 0 375 160"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="5" ry="5" width="75" height="75" />
            <rect x="90" y="0" rx="5" ry="5" width="225" height="20" />
            <rect x="90" y="30" rx="5" ry="5" width="225" height="50" />
            <rect x="0" y="90" rx="5" ry="5" width="75" height="75" />
            <rect x="90" y="90" rx="5" ry="5" width="225" height="20" />
            <rect x="90" y="120" rx="5" ry="5" width="225" height="50" />
          </ContentLoader>
        </div>
      ))}
    </>
  )
}

export default function NewsCard({ articles }) {
  const [showLoader, setShowLoader] = useState(true)
  const [filteredArticles, setFilteredArticles] = useState([])

  useEffect(() => {
    // 每次 articles 改變時都先重設 loader 狀態為 true
    setShowLoader(true)

    // 篩選掉 is_deleted 為 true 的文章
    const validArticles = articles ? articles.filter(article => !article.is_deleted) : []
    setFilteredArticles(validArticles)

    if (validArticles.length > 0) {
      // 延長動畫呈現 3 秒 (3000 毫秒)
      const timer = setTimeout(() => {
        setShowLoader(false)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setShowLoader(false)
    }
  }, [articles])

  if (!filteredArticles || filteredArticles.length === 0) {
    return <p>No related articles found.</p>
  }

  if (showLoader) {
    return <NewsCardLoader />
  }

  return (
    <>
      <ul className={`list-unstyled ${styles['y-news-list']}`}>
        {filteredArticles.map((article, index) => (
          <li className={styles['y-news-item']} key={index}>
            {/* 將圖片容器包裝在錨標籤內 */}
            <a href={`/article/${article.id}`}>
              <div className={styles['y-news-image-container']}>
                <img
                  src={article.image_path}
                  className={styles['y-news-image']}
                  alt={article.title}
                />
              </div>
            </a>
            <div>
              <p className={styles['y-news-tag']}>{article.category_name}</p>
              <a
                href={`/article/${article.id}`}
                className={styles['y-news-title']}
              >
                {article.title}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
