// rent-filter

'use client'

import { useState, useEffect } from 'react'

export default function RentFilter({ onFilterChange }) {
  const [activeSections, setActiveSections] = useState([0]) // 預設只有簡易篩選開啟
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedAdvanced, setSelectedAdvanced] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])

  // 📌 篩選選項狀態
  const [categoryOptions, setCategoryOptions] = useState(['全部'])
  const [equipmentOptions, setEquipmentOptions] = useState([])
  const [brandOptions, setBrandOptions] = useState([])

  useEffect(() => {
    console.log('設備選項:', equipmentOptions)
  }, [equipmentOptions])
  // 📌 從後端 API 獲取篩選選項
  useEffect(() => {
    fetch('https://lenstudio.onrender.com/api/rental-master')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategoryOptions(data.categories || ['全部'])
          setEquipmentOptions(data.equipment || [])
          setBrandOptions(data.brands || [])
        }
      })
      .catch((error) => console.error('❌ 無法載入篩選選項:', error))
  }, []) // 🟢 只在組件掛載時執行一次

  const toggleAccordion = (index) => {
    setActiveSections((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    )
  }

  // 📌 用於更新父組件的篩選邏輯
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        category: selectedCategory,
        advanced: selectedAdvanced,
        brands: selectedBrands,
      })
    }
    // 🚫 不將 `onFilterChange` 放入依賴陣列，避免無限迴圈
    // 只依賴實際篩選條件的變更
  }, [selectedCategory, selectedAdvanced, selectedBrands])

  // 📌 用途篩選 (單選)
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)

    if (category === '全部') {
      setSelectedAdvanced([])
      setSelectedBrands([])
    }
  }

  // 📌 設備篩選 (多選)
  const handleAdvancedChange = (option) => {
    setSelectedAdvanced((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    )
  }

  // 📌 品牌篩選 (多選)
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    )
  }

  return (
    <div className="accordion k-filter" id="filterAccordion">
      {['用途篩選', '設備篩選', '品牌篩選'].map((title, index) => (
        <div className="accordion-item" key={index}>
          <h2 className="accordion-header">
            <button
              className={`accordion-button ${activeSections.includes(index) ? '' : 'collapsed'
                }`}
              type="button"
              onClick={() => toggleAccordion(index)}
            >
              {title}
            </button>
          </h2>
          <div
            className={`accordion-collapse collapse ${activeSections.includes(index) ? 'show' : ''
              }`}
          >
            <div className="accordion-body">
              {index === 0 &&
                categoryOptions.map((category) => (
                  <label
                    key={category}
                    className="d-block"
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => handleCategoryChange(category)}
                      style={{ marginRight: '4px' }}
                    />
                    {category}
                  </label>
                ))}

              {index === 1 &&
                equipmentOptions.map((option) => (
                  <label
                    key={option}
                    className="d-block"
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAdvanced.includes(option)}
                      onChange={() => handleAdvancedChange(option)}
                      style={{ marginRight: '4px' }}
                    />
                    {option}
                  </label>
                ))}

              {index === 2 &&
                brandOptions.map((brand) => (
                  <label
                    key={brand}
                    className="d-block"
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      style={{ marginRight: '4px' }}
                    />
                    {brand}
                  </label>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
