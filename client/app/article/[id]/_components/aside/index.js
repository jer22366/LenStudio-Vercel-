'use client'

import React, { useState, useEffect } from 'react'
import NewsCard from '../news-card'
import AdCard from '../ad-card'
import RecommendedProducts from '../recommended-products'
import style from './index.module.scss'

function AsideComponent({ categoryId, title, subtitle, content, articleId }) {
  // 接收 articleId prop
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        const url = 'https://lenstudio.onrender.com/api/articles/related'
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryId: categoryId,
            title: title,
            content: content,
            articleId: articleId,
          }),
        })
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`)
        }
        const data = await response.json()
        setRelatedArticles(data.data)
      } catch (error) {
        console.error('Error fetching related articles:', error)
      }
    }

    fetchRelatedArticles()
  }, [categoryId, title, content, articleId])

  return (
    <>
      <aside className="y-aside">
        <div className="px-4 rounded">
          <div className="mb-4 title">
            <div className={style['y-title-line']} />
            <h3 className="mb-3" style={{ fontSize: 18, fontWeight: 500 }}>
              延伸閱讀
            </h3>
            <div className={style['y-title-line']} />
          </div>
          <NewsCard articles={relatedArticles} />
        </div>
        {/* <div className="mb-4 title">
          <div className={style['y-title-line']} />
          <h3 className="mb-3" style={{ fontSize: 18, fontWeight: 500 }}>
            本文推薦
          </h3>
          <div className={style['y-title-line']} />
        </div> */}
        {/* 自動搜尋推薦產品 */}
        <RecommendedProducts articleId={articleId} title={title} subtitle={subtitle} content={content} />
      </aside>
    </>
  );
}

const Aside = React.memo(AsideComponent)

export default Aside