// rent-list

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RentPagination from '../rent-pagination/page'
import RentTotal from '../rent-total/page'
import RentOrder from '../rent-order/page'
import RentFilter from '../rent-filter/page'
import RentHashtag from '../rent-hashtag/page'
import RentSearch from '../rent-search/page'
import RentCard from '../rent-card/page'

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createRoot } from "react-dom/client";
import { useRef } from "react";

import { motion } from "framer-motion";


const MySwal = withReactContent(Swal);

export default function RentList() {
  // 📌 狀態管理
  const [rentals, setRentals] = useState([]) // 原始所有租借商品
  const [filteredRentals, setFilteredRentals] = useState([]) // 過濾後的商品
  const [hashtags, setHashtags] = useState([]) // 取得標籤
  const [searchQuery, setSearchQuery] = useState('') // 搜尋關鍵字
  const [currentPage, setCurrentPage] = useState(1) // 目前頁數
  const [itemsPerPage, setItemsPerPage] = useState(12) // 每頁顯示數量
  const [totalPages, setTotalPages] = useState(1) // 總頁數
  const [sorting, setSorting] = useState('') // 排序方式
  const [shouldAnimate, setShouldAnimate] = useState(false);  // 判斷動畫觸發
  const router = useRouter(); // ✅ 正確初始化 router

  // 📌 篩選選項狀態
  const [categories, setCategories] = useState([]) // 用途分類
  const [equipment, setEquipment] = useState([]) // 設備分類
  const [brands, setBrands] = useState([]) // 品牌分類

  // 📌 彈窗選項狀態
  const [swalRoot, setSwalRoot] = useState(null); // 儲存 React Root
  const [swalRendered, setSwalRendered] = useState(false); // ✅ **確保 `swal` 內的 React 正確刷新**

  // 📌 篩選條件
  const [filters, setFilters] = useState({
    category: '全部',
    advanced: [],
    brands: [],
  })

  // 📌 手機板按鈕
  // 初始位置
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 65, // 靠右 ( -自己50px )
    y: 165,
  }));
  // 邊界範圍
  const [constraints, setConstraints] = useState({
    left: 10,
    right: window.innerWidth - 65,
    top: 100,
    bottom: window.innerHeight - 160,
  });

  // 📌 上移動畫 (頁面進入時 & 路由切換)
  useEffect(() => {
    const triggerAnimation = () => {
      setShouldAnimate(true);
      setTimeout(() => {
        setShouldAnimate(false);
      }, 500); // 動畫時長保持一致
    };

    const hasAnimated = sessionStorage.getItem('hasAnimated');
    if (!hasAnimated) {
      sessionStorage.setItem('hasAnimated', 'true');
      triggerAnimation();
    } else {
      triggerAnimation(); // ✅ 讓路由切換後也能觸發動畫
    }
  }, [router]); // ✅ 監聽 router 變化，每次切換路由時觸發動畫

  // 📌 當 `filteredRentals` 或 `itemsPerPage` 變更時，重新計算 `totalPages`
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredRentals.length / itemsPerPage)))
  }, [filteredRentals, itemsPerPage])

  // 📌 RWD 視窗大小變更時，調整 `itemsPerPage`
  useEffect(() => {
    const updateItemsPerPage = () => {
      // 📌 計算當前頁面的第一個商品索引，確保視窗變更後能保持當前商品可見。
      const indexOfFirstItem = (currentPage - 1) * itemsPerPage
      // 📌 根據視窗大小動態設定 `itemsPerPage`，以適應 RWD 的顯示需求。
      let newItemsPerPage

      if (window.innerWidth < 768) {
        newItemsPerPage = 6
      } else if (window.innerWidth < 992) {
        newItemsPerPage = 8
      } else {
        newItemsPerPage = 12
      }
      setItemsPerPage(newItemsPerPage)

      // 📌 計算新的頁碼，根據第一個商品的索引重新定位頁面，避免頁數錯位。
      const newPage = Math.floor(indexOfFirstItem / newItemsPerPage) + 1
      setCurrentPage(newPage)
    }

    updateItemsPerPage() // ✅ 初始化時立即執行
    // 📌 監聽視窗大小變更事件，在視窗大小變更時自動調整分頁顯示數量。
    window.addEventListener('resize', updateItemsPerPage)
    // 📌 清除事件監聽器，避免組件卸載時潛在的內存洩漏 (memory leak)。
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [currentPage, itemsPerPage])


  // 📌 從 API 獲取租借商品和標籤 + 收藏狀態(如果有登入)
  const fetchData = async () => {
    try {
      const params = new URLSearchParams()

      if (searchQuery) params.append('query', searchQuery)
      if (filters.category && filters.category !== '全部') {
        params.append('category', filters.category)
      }
      filters.advanced.forEach((adv) => params.append('advanced', adv))
      filters.brands.forEach((brand) => params.append('brands', brand))

      // 先判斷是否登入 再決定要不要撈收藏
      const token = localStorage.getItem('loginWithToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 🚀  只發送一次 API
      const res = await fetch(`https://lenstudio.onrender.com/api/rental?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success) {
        setRentals(data.rentals) // 設定所有商品
        setFilteredRentals(data.rentals) // 預設顯示所有商品
        setHashtags(data.tags || []) // 確保標籤至少為空陣列
        setTotalPages(
          Math.max(1, Math.ceil(data.rentals.length / itemsPerPage))
        ) // 設定總頁數
        setCategories(data.categories || [])
        setEquipment(data.equipment || [])
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error('❌ 無法載入資料:', error)
    }
  }
  // 📌 初始化時載入資料
  useEffect(() => {
    fetchData(); // ✅ 初次載入時執行一次
    filtersRef.current = filters; // ✅ 設定初始值，避免影響後續判斷
  }, []);

  const filtersRef = useRef(filters);

  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(filtersRef.current);

    if (filtersChanged || searchQuery !== filtersRef.current.searchQuery) {
      filtersRef.current = { ...filters, searchQuery }; // ✅ 確保 `searchQuery` 變化時也更新
      fetchData();
      setCurrentPage(1);
    }
  }, [filters, searchQuery]);



  // 📌 點擊 Hashtag 時，將 Hashtag 設定為搜尋關鍵字
  const handleHashtagClick = (tag) => {
    setSearchQuery(tag) // ✅ 點擊標籤時，觸發搜尋
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => {
      // 如果 `newFilters` 跟 `prevFilters` 相同，不要更新
      if (
        prevFilters.category === newFilters.category &&
        JSON.stringify(prevFilters.advanced) === JSON.stringify(newFilters.advanced) &&
        JSON.stringify(prevFilters.brands) === JSON.stringify(newFilters.brands)
      ) {
        return prevFilters; // 不變更狀態，避免不必要的 re-render
      }

      return newFilters; // 只有真的變更時才更新狀態
    });
    setCurrentPage(1);
  };

  // 📌 商品排序功能
  const sortedRentals = [...filteredRentals].sort((a, b) => {
    if (sorting === 'fee_asc') return a.fee - b.fee; // 價格由低到高
    if (sorting === 'fee_desc') return b.fee - a.fee; // 價格由高到低
    if (sorting === 'rating_desc') return b.average_rating - a.average_rating; // 評分高到低
    if (sorting === 'reviews_desc') return b.total_reviews - a.total_reviews; // 評論數量多到少
    return 0;
  });

  // 📌 計算當前頁面的商品範圍
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const visibleItems = sortedRentals.slice(indexOfFirstItem, indexOfLastItem)

  // 📌 手機板按鈕
  useEffect(() => {
    const handleResize = () => {
      setConstraints({
        left: 10,
        right: window.innerWidth - 65,
        top: 100,
        bottom: window.innerHeight - 160,
      });

      setPosition((prev) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const newX = prev.x < screenWidth / 2 ? 10 : screenWidth - 65;
        const newY = Math.max(100, Math.min(screenHeight - 160, prev.y)); // ✅ 保持範圍一致
        return { x: newX, y: newY };
      });
    };
    handleResize(); // ✅ 初始化時立即更新

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 拖動後自動吸附
  const handleDragEnd = (event, info) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const newX = info.point.x;
    const newY = info.point.y;

    let finalX = newX < screenWidth / 2 ? 10 : screenWidth - 65;
    let finalY = Math.max(100, Math.min(screenHeight - 160, newY));

    // 確保 UI 正確更新
    requestAnimationFrame(() => {
      setPosition({ x: finalX, y: finalY });

      // ✅ **強制 `motion` 重新運行動畫**
      setTimeout(() => {
        setPosition({ x: finalX + 1, y: finalY }); // 小幅度變化
        setTimeout(() => {
          setPosition({ x: finalX, y: finalY }); // 回到正確位置
        }, 10);
      }, 10);
    });
  };

  // 📌 手機板彈窗效果
  const handleOpenFilterModal = () => {
    MySwal.fire({
      title: "快速查詢",
      html: `<div id="swal-filter-container"></div>`,
      didOpen: () => {
        if (window.innerWidth > 767) {
          MySwal.close();
          return;
        }
        const container = document.getElementById("swal-filter-container");
        if (container) {
          const root = createRoot(container);
          setSwalRoot(root);
          setSwalRendered(true); // ✅ **讓 `useEffect` 監聽這個變數，確保 UI 刷新**
          renderSwalContent(root);
        }
        const handleResize = () => {
          if (window.innerWidth > 767) {
            MySwal.close();
          }
        };
        window.addEventListener("resize", handleResize);

        // 📌 **在 SweetAlert2 關閉時，移除事件監聽**
        MySwal.getPopup().addEventListener("transitionend", () => {
          window.removeEventListener("resize", handleResize);
        });
      },
      showConfirmButton: false,
      showCloseButton: true,
      closeButtonHtml: "&times;",
      position: 'top',
      customClass: {
        title: "k-filter-swal-title",
        popup: "k-filter-swal-popup",
        closeButton: "k-filter-swal-close",
        htmlContainer: "k-filter-swal-container",
      },
      willClose: () => {
        if (swalRoot) {
          swalRoot.unmount();
          setSwalRoot(null); // 避免記憶體洩漏
          setSwalRendered(false);
        }
        setFilters((prev) => ({ ...prev })); // ✅ 確保 `swal` 內的 `filters` 變更時，關閉時仍然保留
      },
    });
  };

  useEffect(() => {
    if (swalRendered && swalRoot) {
      renderSwalContent(swalRoot);
    }
  }, [searchQuery, filters]);

  const renderSwalContent = (root) => {
    root.render(
      <div>
        <RentSearch
          searchQuery={searchQuery}
          setSearchQuery={(value) => {
            setSearchQuery(value);
          }}
        />
        <RentHashtag
          hashtags={hashtags}
          onHashtagClick={(tag) => {
            setSearchQuery(tag);
          }}
        />
        <RentFilter
          categories={categories}
          equipment={equipment}
          brands={brands}
          onFilterChange={(Filters) => {
            setFilters(Filters); // ✅ 只更新 filters，讓子元件管理 UI
          }}
          filters={filters} // ✅ 讓 `swal` 內的 `RentFilter` 直接拿到 `filters`，確保同步
        />
      </div>
    );
  };


  return (
    <div className="row">
      {/* 📌 側邊篩選功能 */}
      <aside className="col-0 col-md-4 col-lg-3 p-3 k-filter-top d-none d-md-block" >
        <hr className="d-none d-md-block" />
        <RentSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <RentHashtag hashtags={hashtags} onHashtagClick={handleHashtagClick} />
        <RentFilter
          categories={categories}
          equipment={equipment}
          brands={brands}
          onFilterChange={handleFilterChange}
          filters={filters} />
      </aside>

      {/* 📌 主要內容區域 */}
      <main className="col-12 col-md-8 col-lg-9">
        {/* 📌 總數 & 排序 */}
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <RentTotal
            totalItems={filteredRentals.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />
          <RentOrder setSorting={setSorting} />
        </div>

        {/* 📌 商品清單 */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
          {visibleItems.map((rental) => (
            <RentCard
              key={rental.id}
              rental={{
                ...rental,
                rating: Number(rental.average_rating) || 0, // 確保 rating 是數字
                reviewsCount: rental.total_reviews || 0, // 確保評論數不為 null
              }}
              shouldAnimate={shouldAnimate}
            />

          ))}
        </div>

        {/* 📌 分頁功能 */}
        <RentPagination
          totalItems={filteredRentals.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </main>

      <div className='d-block d-md-none'>
        <motion.button
          drag
          dragMomentum={false} // 不要拖曳慣性
          dragConstraints={constraints} // ✅ 讓約束條件隨視窗變動
          initial={{ x: position.x, y: position.y }} // ✅ 確保初始位置正確
          animate={{ x: position.x, y: position.y }} // ✅ 確保按鈕不會消失
          className='k-filter-btn'
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            zIndex: 999,
          }}
          onDragEnd={handleDragEnd}
          onClick={handleOpenFilterModal}
        >
          <img src='images/icon/search-2.svg' alt="手機板篩選按鈕" style={{ pointerEvents: 'none' }}></img>
        </motion.button>
      </div>
    </div >
  )
}
