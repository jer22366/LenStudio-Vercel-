'use client'

import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import styles from './AddArticleModal.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

export default function BackSelectTitle({ confirmClose }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 改成後端路由掛載後的 URL
        const response = await axios.get(
          'https://lenstudio.onrender.com/api/articles/categories'
        )
        if (response.data && response.data.data) {
          setCategories(response.data.data)
        } else {
          console.error('API 回應格式錯誤:', response.data)
        }
      } catch (error) {
        console.error('取得分類失敗：', error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div>
      {/* 返回按鈕 */}
      <button
        type="button"
        onClick={confirmClose}
        className={`mb-3 ${styles['y-btn-back']} allowed-close`}
      >
        <FontAwesomeIcon icon={faAngleLeft} />
      </button>
      {/* <h1 className="mb-4">新增文章</h1> */}

      {/* 文章分類 */}
      <div
        className={`my-4 ${styles['y-category-add-btn']} d-flex align-items-center`}
      >
        <p className="mb-0">
          文章分類 <span className={`mx-1 ${styles['red-sign']}`}>*</span>：
        </p>
        <select name="文章分類" className="form-select me-4">
          <option value="0">選擇分類</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* 標題與副標題輸入 */}
      <input
        type="text"
        className={`my-4 form-control ${styles['form-control']}`}
        placeholder="標題 (必填)"
      />
      <input
        type="text"
        className={`my-4 form-control ${styles['form-control']}`}
        placeholder="副標題"
      />
    </div>
  )
}
