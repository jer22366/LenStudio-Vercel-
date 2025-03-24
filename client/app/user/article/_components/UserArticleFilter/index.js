'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './index.module.scss'

export default function UserArticleFilter({ onFilterChange, resultCount }) {
  const [categories, setCategories] = useState([{ value: '', label: '全部類別' }])
  const [years, setYears] = useState([{ value: '', label: '年份' }])
  const [months] = useState([
    { value: '', label: '月份' },
    { value: '01', label: '01' },
    { value: '02', label: '02' },
    { value: '03', label: '03' },
    { value: '04', label: '04' },
    { value: '05', label: '05' },
    { value: '06', label: '06' },
    { value: '07', label: '07' },
    { value: '08', label: '08' },
    { value: '09', label: '09' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
  ])

  // 載入分類與年份資料
  useEffect(() => {
    const controller = new AbortController()

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          'https://lenstudio.onrender.com/api/articles/categories',
          { signal: controller.signal }
        )
        // 不再過濾 count，全部顯示
        const categoryOptions = response.data.data.map(category => ({
          value: category.id,
          label: category.name,
        }))
        setCategories(prev => [...prev, ...categoryOptions])
      } catch (err) {
        if (
          err.name === 'CanceledError' ||
          err.message === 'Request aborted'
        ) {
          console.log('分類請求已被中斷')
        } else {
          console.error('取得分類失敗', err)
        }
      }
    }

    const fetchYears = async () => {
      try {
        const response = await axios.get(
          'https://lenstudio.onrender.com/api/articles/years',
          { signal: controller.signal }
        )
        // 不再過濾 count，全部顯示
        const yearOptions = response.data.data.map(year => ({
          value: year.year,
          label: year.year,
        }))
        setYears(prev => [...prev, ...yearOptions])
      } catch (err) {
        if (
          err.name === 'CanceledError' ||
          err.message === 'Request aborted'
        ) {
          console.log('年份請求已被中斷')
        } else {
          console.error('取得年份失敗', err)
        }
      }
    }

    fetchCategories()
    fetchYears()

    return () => {
      controller.abort()
    }
  }, [])

  // 當選項改變時觸發篩選
  const handleFilterChange = () => {
    const selectedCategory = document.getElementById('select-category').value
    const selectedYear = document.getElementById('select-year').value
    const selectedMonth = document.getElementById('select-month').value

    if (!selectedCategory && !selectedYear && !selectedMonth) {
      onFilterChange({})
    } else {
      onFilterChange({
        category: selectedCategory,
        year: selectedYear,
        month: selectedMonth,
      })
    }
  }

  // 清除所有選項
  const handleClear = () => {
    document.querySelectorAll('select').forEach(select => {
      select.selectedIndex = 0
    })
    handleFilterChange()
  }

  // 修改 renderSelect 函數，使樣式與 select-list 一致
  const renderSelect = (id, options, title) => (
    <select
      id={id}
      className={`form-select select04 me-sm-2 ${styles['y-custom-select']}`}
      title={title}
      onChange={handleFilterChange}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  return (
    <>
      <div
        className={`my-sm-3 ${styles['y-list-title']} d-flex justify-content-between align-items-center`}
      >
        {typeof resultCount !== 'undefined' && (
          <p className="text-black mt-2">搜尋到 {resultCount} 筆資料</p>
        )}
      </div>
      <div className="mb-3">
        <div className={`d-flex flex-wrap justify-content-between y-selection`}>
          <div className={`d-flex flex-wrap justify-content-start ${styles['y-collapse-area']}`}>
            {renderSelect('select-category', categories, 'Select Category')}
            {renderSelect('select-year', years, 'Select Year')}
            {renderSelect('select-month', months, 'Select Month')}
          </div>
          <div className={styles['y-clear-option']}>
            <button
              id="y-clear-options-btn"
              className="btn btn-link"
              onClick={handleClear}
            >
              清除選項
            </button>
          </div>
        </div>
      </div>
      <div className={`${styles['y-title-line']}`}></div>
    </>
  )
}