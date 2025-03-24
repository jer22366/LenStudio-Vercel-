// rent-filter

'use client'

import { useState, useEffect } from 'react'

export default function RentFilter({ categories, equipment, brands, onFilterChange, filters }) {
  const [activeSections, setActiveSections] = useState([0]) // 預設只有簡易篩選開啟

  const [selectedCategory, setSelectedCategory] = useState(filters.category || '全部');
  const [selectedAdvanced, setSelectedAdvanced] = useState(filters.advanced || []);
  const [selectedBrands, setSelectedBrands] = useState(filters.brands || []);

  useEffect(() => {
    setSelectedCategory(filters.category || '全部');
    setSelectedAdvanced(filters.advanced || []);
    setSelectedBrands(filters.brands || []);
  }, [filters]); // ✅ 確保 `filters` 變動時，內部 UI 也會變動

  // 📌 新增 `isMobile` 狀態來判斷是否為小螢幕
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)

  // 📌 監聽視窗大小變化，更新 `isMobile` 狀態
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 📌 手風琴開關邏輯
  const toggleAccordion = (index) => {
    setActiveSections((prev) => {
      if (isMobile) {
        // 📌 手機模式：點擊時關閉其他手風琴，只展開單一項目
        return prev.includes(index) ? [] : [index]
      } else {
        // 📌 桌機模式：允許多個展開
        return prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
      }
    })
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
    // ✅ 先更新 `setState`，確保 `filters` 內的值是最新的
    const newAdvanced = category === '全部' ? [] : selectedAdvanced;
    const newBrands = category === '全部' ? [] : selectedBrands;

    setSelectedCategory(category);
    setSelectedAdvanced(newAdvanced);
    setSelectedBrands(newBrands);

    // ✅ 使用 `useEffect` 來統一更新 `onFilterChange`
    setTimeout(() => {
      onFilterChange({
        category,
        advanced: newAdvanced,
        brands: newBrands
      });
    }, 0);
  };

  // const handleCategoryChange = (category) => {
  //   setSelectedCategory(category)
  //   if (category === '全部') {
  //     setSelectedAdvanced([])
  //     setSelectedBrands([])
  //   }

  //   onFilterChange({
  //     category,
  //     advanced: selectedAdvanced,
  //     brands: selectedBrands
  //   })
  // }


  // 📌 設備篩選 (多選)
  const handleAdvancedChange = (option) => {
    const newAdvanced = selectedAdvanced.includes(option)
      ? selectedAdvanced.filter((item) => item !== option)
      : [...selectedAdvanced, option]

    setSelectedAdvanced(newAdvanced)
    onFilterChange({ category: selectedCategory, advanced: newAdvanced, brands: selectedBrands })
  }

  // 📌 品牌篩選 (多選)
  const handleBrandChange = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((item) => item !== brand)
      : [...selectedBrands, brand]

    setSelectedBrands(newBrands)
    onFilterChange({ category: selectedCategory, advanced: selectedAdvanced, brands: newBrands })
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
              <div className="k-radio-group">
                {index === 0 &&
                  categories.map((category) => (
                    <label
                      key={category}
                      className="k-custom-radio"
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryChange(category)}
                        style={{ marginRight: '4px', display: "none" }}
                      />
                      <span className="radio">
                        {filters.category === category && <span className="dot"></span>}
                      </span>
                      {category}
                    </label>
                  ))}
              </div>

              <div className="k-radio-group">
                {index === 1 &&
                  equipment.map((option) => (
                    <label
                      key={option}
                      className="k-custom-radio"
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
              </div>
              <div className="k-radio-group">
                {index === 2 &&
                  brands.map((brand) => (
                    <label
                      key={brand}
                      className="k-custom-radio"
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
        </div>
      ))}
    </div>
  )
}
