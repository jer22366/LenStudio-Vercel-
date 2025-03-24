'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './index.module.scss' // SCSS 模組
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import dynamic from 'next/dynamic'
gsap.registerPlugin(TextPlugin)

const ContentLoader = dynamic(() => import('react-content-loader'), {
  ssr: false,
})

export default function TitleShareFontSize({
  categoryName = '未分類',
  articleTitle = '載入中...',
  articleSubTitle = '',
  createdAt = '載入中...',
  imagePath = '/images/article/default-Img.jpg',
  user = {}, // 新增: 傳入 user 資料，例如 { nickname, name, head }
  loading = true, // 新增 loading 狀態
}) {
  const [fontSize, setFontSize] = useState('medium')
  const [isImageVisible, setIsImageVisible] = useState(false)

  // 文字尺寸對應
  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }

  const changeFontSize = (size) => {
    setFontSize(size)
  }

  // 更新文章段落字體
  useEffect(() => {
    const paragraphs = document.querySelectorAll('article p')
    paragraphs.forEach((p) => {
      p.style.fontSize = fontSizes[fontSize]
    })
  }, [fontSize])

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '載入中...'
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // 主圖片顯示動畫—使用 IntersectionObserver 觀察
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsImageVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )
    const mainImage = document.querySelector(`.${styles['main-image']}`)
    if (mainImage) {
      observer.observe(mainImage)
    }
    return () => observer.disconnect()
  }, [imagePath])

  // 為標題與副標題加入動畫效果
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  useEffect(() => {
    if (articleTitle !== '載入中...') {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 15, opacity: 0.1 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        )
      }
      if (articleSubTitle && subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 15, opacity: 0.1 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        )
      }
    }
  }, [articleTitle, articleSubTitle])

  return (
    <>
      {/* 標題與分享區塊 */}
      <div
        className={`mb-2 ${styles['y-tag-date-share']} d-sm-flex justify-content-between align-items-end`}
      >
        <div className={`${styles['y-tag-date']} d-flex align-items-center`}>
          {loading ? (
            <ContentLoader
              speed={2}
              width={89} // 調整寬度以符合文字區域
              height={33} // 調整高度以符合文字區域
              viewBox="0 0 89 33" // 調整 viewBox 以符合文字區域
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <rect x="0" y="0" rx="3" ry="3" width="80" height="24" />
            </ContentLoader>
          ) : (
            <div className={`px-3 py-1 ${styles['y-article-tag']}`}>
              {categoryName}
            </div>
          )}
          <div className="ms-2">
            <p className={`mb-0 ${styles['y-article-date']}`}>{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>

      {/* 主標題 */}
      <h1 ref={titleRef} className={`mb-sm-2 ${styles['y-tag-date-share-h1']}`}>
        {articleTitle}
      </h1>

      {/* 副標題 (若有) */}
      {articleSubTitle && (
        <p ref={subtitleRef} className={`mb-sm-4 ${styles['y-tag-date-share-subtitle']}`}>
          {articleSubTitle}
        </p>
      )}

      {/* 分隔線 */}
      <div className={`mb-5 ${styles['y-title-line']}`}></div>

      {/* 使用者資訊與字體控制區塊 */}
      <div className="mb-4 d-flex align-items-center justify-content-between text-muted">
        <div className="d-flex align-items-center me-3">
          {loading ? (
            <ContentLoader
              speed={2}
              width={120}
              height={40}
              viewBox="0 0 120 40"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <circle cx="20" cy="20" r="20" />
              <rect x="45" y="10" rx="3" ry="3" width="70" height="10" />
            </ContentLoader>
          ) : (
            <>
              {/* 使用者頭像 */}
              <img
                src={user.head || '/images/article/user (1).jpg'}
                alt="Avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span className="ms-2">
                {user.nickname || user.name || '編輯部'}
              </span>
            </>
          )}
        </div>

        {/* 字體大小控制區塊 */}
        <div className="y-font-size-control ms-3">
          字級：
          <button
            className={`p-0 btn btn-link ${fontSize === 'small' ? 'text-muted' : ''}`}
            style={{
              color: fontSize === 'small' ? '#8F8F8F' : '#143146',
              textDecoration: fontSize === 'small' ? 'none' : 'underline'
            }}
            onClick={() => changeFontSize('small')}
          >
            小
          </button>
          /
          <button
            className={`p-0 btn btn-link ${fontSize === 'medium' ? 'text-muted' : ''}`}
            style={{
              color: fontSize === 'medium' ? '#8F8F8F' : '#143146',
              textDecoration: fontSize === 'medium' ? 'none' : 'underline'
            }}
            onClick={() => changeFontSize('medium')}
          >
            中
          </button>
          /
          <button
            className={`p-0 btn btn-link ${fontSize === 'large' ? 'text-muted' : ''}`}
            style={{
              color: fontSize === 'large' ? '#8F8F8F' : '#143146',
              textDecoration: fontSize === 'large' ? 'none' : 'underline'
            }}
            onClick={() => changeFontSize('large')}
          >
            大
          </button>
        </div>
      </div>

      {/* 主圖片 */}
      {imagePath && (
        <img
          src={imagePath}
          className={`mb-4 border rounded y-img-fluid ${styles['y-container']} ${styles['main-image']} ${isImageVisible ? styles['article-image-fade'] : ''}`}
          alt={articleTitle}
          style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
        />
      )}
    </>
  )
}
