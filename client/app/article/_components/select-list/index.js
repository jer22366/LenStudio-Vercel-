'use client'

import React, { useEffect, useState, useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import styles from './index.module.scss'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import AnimateHeight from 'react-animate-height'

export default function SelectList({ onFilterChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const expandAnimRef = useRef(null);
  const collapseAnimRef = useRef(null);
  const [categories, setCategories] = useState([
    { value: '', label: '全部類別' },
  ])
  const [years, setYears] = useState([{ value: '', label: '年份' }])
  const [months, setMonths] = useState([
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
  const [openSelect, setOpenSelect] = useState({})
  const router = useRouter()

  // 動態載入 Bootstrap JS（僅在 client-side）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('bootstrap/dist/js/bootstrap.bundle.min.js')
    }
  }, [])

  // 定義 handleFilterChange 函式
  const handleFilterChange = () => {
    const scrollPosition = window.scrollY

    const selectedCategory = document.getElementById('select-category').value
    const selectedYear = document.getElementById('select-year').value
    const selectedMonth = document.getElementById('select-month').value

    // 觸發父層傳入的 onFilterChange 進行篩選
    if (onFilterChange) {
      onFilterChange({
        category: selectedCategory,
        year: selectedYear,
        month: selectedMonth,
      })
    }

    // 使用 setTimeout 確保更新完成後再還原滾動位置
    setTimeout(() => {
      window.scrollTo(0, scrollPosition)
    }, 100)
  }

  const renderSelect = (id, options, title) => (
    <select
      id={id}
      className="form-select select04 me-sm-2"
      title={title}
      onChange={handleFilterChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  // 載入分類與年份等資料
  useEffect(() => {
    const controller = new AbortController()

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          'https://lenstudio.onrender.com/api/articles/categories',
          {
            signal: controller.signal,
          }
        )
        const categoryOptions = response.data.data.map((category) => ({
          value: category.id,
          label: category.name,
        }))
        setCategories((prev) => [...prev, ...categoryOptions])
      } catch (err) {
        if (err.name === 'CanceledError' || err.message === 'Request aborted') {
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
          {
            signal: controller.signal,
          }
        )
        const yearOptions = response.data.data.map((year) => ({
          value: year.year,
          label: year.year,
        }))
        setYears((prev) => [...prev, ...yearOptions])
      } catch (err) {
        if (err.name === 'CanceledError' || err.message === 'Request aborted') {
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

  // 添加到 SelectList 組件內的其他 useEffect 之前
  useEffect(() => {
    // 確保組件掛載後 SVG 動畫元素已經存在
    setTimeout(() => {
      // 確保初始化時箭頭指向正確方向
      if (isCollapsed) {
        // 如果是收起狀態，確保箭頭朝下
        const svgPolyline = document.getElementById('accordion-icon');
        if (svgPolyline) {
          svgPolyline.setAttribute('points', '15 1.13 8.5 7.72 2 1.13');
        }
      } else {
        // 如果是展開狀態，確保箭頭朝上
        const svgPolyline = document.getElementById('accordion-icon');
        if (svgPolyline) {
          svgPolyline.setAttribute('points', '15 7.72 8.5 1.13 2 7.72');
        }
      }
    }, 100);
  }, []);

  // 監聽折疊狀態變化，觸發動畫
  useEffect(() => {
    const collapseEl = document.getElementById('filter-collapse')

    // 保存事件處理函數的引用
    const handleShow = () => {
      setIsAnimating(true);
      setIsCollapsed(false);
      if (expandAnimRef.current) {
        expandAnimRef.current.beginElement();
      }
    };

    const handleHide = () => {
      setIsAnimating(true);
      setIsCollapsed(true);
      if (collapseAnimRef.current) {
        collapseAnimRef.current.beginElement();
      }
    };

    const handleShown = () => {
      setTimeout(() => setIsAnimating(false), 100); // 與動畫持續時間一致
    };

    const handleHidden = () => {
      setTimeout(() => setIsAnimating(false), 100); // 與動畫持續時間一致
    };

    if (collapseEl) {
      // 使用保存的函數引用添加事件監聽器
      collapseEl.addEventListener('show.bs.collapse', handleShow);
      collapseEl.addEventListener('hide.bs.collapse', handleHide);
      collapseEl.addEventListener('shown.bs.collapse', handleShown);
      collapseEl.addEventListener('hidden.bs.collapse', handleHidden);
    }

    return () => {
      if (collapseEl) {
        // 使用相同的函數引用移除事件監聽器
        collapseEl.removeEventListener('show.bs.collapse', handleShow);
        collapseEl.removeEventListener('hide.bs.collapse', handleHide);
        collapseEl.removeEventListener('shown.bs.collapse', handleShown);
        collapseEl.removeEventListener('hidden.bs.collapse', handleHidden);
      }
    }
  }, []) // 確保依賴陣列為空，只在組件掛載和卸載時運行

  // 修改後的切換函數
  const toggleCollapse = () => {
    if (!isAnimating) {
      setIsAnimating(true);

      // 先啟動動畫
      if (isCollapsed) {
        if (expandAnimRef.current) {
          expandAnimRef.current.beginElement();
        }
      } else {
        if (collapseAnimRef.current) {
          collapseAnimRef.current.beginElement();
        }
      }

      // 使用 requestAnimationFrame 確保在下一幀再更改狀態
      requestAnimationFrame(() => {
        setIsCollapsed(!isCollapsed);
      });

      // 在動畫結束後恢復按鈕可用狀態
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  // 在其他 useEffect 之後添加
  useEffect(() => {
    // 直接取得動畫元素引用
    expandAnimRef.current = document.getElementById('expand-anim');
    collapseAnimRef.current = document.getElementById('collapse-anim');

    // 強制重繪以確保 SVG 動畫準備就緒
    const svgElement = document.querySelector(`.${styles['accordion-icon-svg']}`);
    if (svgElement) {
      svgElement.style.display = 'none';
      svgElement.getBoundingClientRect(); // 強制重排
      svgElement.style.display = '';
    }
  }, []);

  return (
    <>
      <div id="article-filter-section" className={`${styles['y-title-line']} mt-5`}></div>
      <div
        className={`my-sm-3 ${styles['y-list-title']} d-flex justify-content-between align-items-center`}
      >
        <h2 className="mb-0">所有文章</h2>

        <button
          className={`mb-0 btn rounded-pill btn-select-use d-flex align-items-center ${isAnimating ? styles['btn-disabled'] : ''}`}
          type="button"
          onClick={toggleCollapse}
          disabled={isAnimating}
        >
          篩選條件
          <svg className={`${styles['accordion-icon-svg']} ms-1`} viewBox="0 0 17 8.85" height="24px" width="24px">
            <polyline
              id="accordion-icon"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              fillRule="evenodd"
              points={isCollapsed ? "15 1.13 8.5 7.72 2 1.13" : "15 7.72 8.5 1.13 2 7.72"}
            >
              <animate
                id="expand-anim"
                ref={expandAnimRef}
                attributeName="points"
                values="15 1.13 8.5 7.72 2 1.13; 15 7.72 8.5 1.13 2 7.72"
                dur="300ms"
                begin="indefinite"
                fill="freeze"
                calcMode="spline"
                keySplines="0.33, 1, 0.68, 1"
              />
              <animate
                id="collapse-anim"
                ref={collapseAnimRef}
                attributeName="points"
                values="15 7.72 8.5 1.13 2 7.72; 15 1.13 8.5 7.72 2 1.13"
                dur="300ms"
                begin="indefinite"
                fill="freeze"
                calcMode="spline"
                keySplines="0.33, 1, 0.68, 1"
              />
            </polyline>
          </svg>
        </button>

        {typeof resultCount !== 'undefined' && (
          <p className="text-black mt-2">搜尋到 {resultCount} 筆資料</p>
        )}
      </div>

      <AnimateHeight
        duration={400}
        height={isCollapsed ? 0 : 'auto'}
        easing={'cubic-bezier(0.33, 1, 0.68, 1)'}
        className="mb-3"
      >
        <div className="d-flex justify-content-between y-selection">
          <div
            className={`d-flex justify-content-start ${styles['y-collapse-area']}`}
          >
            {renderSelect('select-category', categories, 'Select Category')}
            {renderSelect('select-year', years, 'Select Year')}
            {renderSelect('select-month', months, 'Select Month')}
          </div>
          <div className={styles['y-clear-option']}>
            <button
              id="y-clear-options-btn"
              className="btn btn-link"
              onClick={() => {
                const scrollPosition = window.scrollY // 記住滾動位置

                document.querySelectorAll('select').forEach((select) => {
                  select.selectedIndex = 0
                }) // 清除選項

                // 先清除選項，再觸發篩選和滾動
                Promise.resolve()
                  .then(() => handleFilterChange()) // 觸發篩選
                  .then(() => router.push('/article')) // 使用 router.push 導航
                  .then(() => {
                    // 確保 router.push 完成後再滾動
                    setTimeout(() => {
                      window.scrollTo(0, scrollPosition) // 恢復滾動位置
                    }, 100)
                  })
              }}
            >
              清除選項
            </button>
          </div>
        </div>
      </AnimateHeight>
      <div className={`${styles['y-title-line']} mt-3`}></div>
    </>
  )
}
