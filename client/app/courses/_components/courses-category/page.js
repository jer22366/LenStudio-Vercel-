'use client'

import styles from './course-category.module.scss'
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation' // ✅ 讀取 URL 參數與導航

export default function CoursesCategory({ selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchParams = useSearchParams() // ✅ 取得 URL 參數
  const router = useRouter() // ✅ 控制 URL
  const category = searchParams.get('category') || '所有課程' // ✅ 確保 URL 變更時同步分類

  // 🚀 **初始化分類**
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://lenstudio.onrender.com/api/courses/categories');
        if (!res.ok) throw new Error(`HTTP 錯誤！狀態碼：${res.status}`);

        const data = await res.json();
        // console.log('📢 取得的分類資料:', data);

        // ✅ 過濾掉空白分類
        const filteredData = data.filter(category => category.name.trim() !== '');

        setCategories([{ name: '所有課程' }, ...filteredData]); // 確保「所有課程」在第一個
      } catch (err) {
        console.error('❌ 無法取得分類資料:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  // 🚀 **監聽 URL `category` 變更時，更新 `selectedCategory`**
  useEffect(() => {
    if (selectedCategory !== category) {
      setSelectedCategory(category)
    }
  }, [category]) // ✅ 當 URL `category` 變更時觸發

  if (loading) return <p>載入分類中...</p>
  if (error) return <p className="text-danger">無法載入分類：{error}</p>

  return (
    <section className={`${styles['category-nav']} ${styles['nav-fixed-2']}`} data-type="nav-fixed-2">
      <ul>
        {categories.map((category) => (
          <li
            key={category.name}
            className={`${styles['category-list']} ${selectedCategory === category.name ? styles['active'] : ''}`}
            onClick={() => {
              // console.log('🛠 設定分類:', category.name)

              // ✅ 更新 URL 讓 `useSearchParams` 監聽
              router.push(`/courses?category=${encodeURIComponent(category.name)}`, { scroll: false })

              // ✅ 更新 `selectedCategory`
              setSelectedCategory(category.name)
            }}
          >
            <a href="#" onClick={(e) => e.preventDefault()}>
              <div className={styles['circle-active']} />
              <p className="m-0">{category.name}</p>
            </a>
          </li>
        ))}
      </ul>

      <div className="gradient" />
    </section>
  )
}
