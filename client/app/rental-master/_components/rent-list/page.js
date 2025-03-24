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

export default function RentList() {
  // 📌 **狀態管理**
  const [rentals, setRentals] = useState([]) // 原始所有租借商品
  const [filteredRentals, setFilteredRentals] = useState([]) // 過濾後的商品
  const [hashtags, setHashtags] = useState([]) // 取得標籤
  const [searchQuery, setSearchQuery] = useState('') // 搜尋關鍵字
  const [currentPage, setCurrentPage] = useState(1) // 目前頁數
  const [itemsPerPage, setItemsPerPage] = useState(12) // 每頁顯示數量
  const [totalPages, setTotalPages] = useState(1) // 總頁數
  const [sorting, setSorting] = useState('') // 排序方式
  const [shouldAnimate, setShouldAnimate] = useState(false);  // 判斷動畫觸發
  const [user, setUser] = useState(null); // 用戶資訊 (包含 level 權限)
  const [loading, setLoading] = useState(true); // 載入狀態
  const router = useRouter(); // ✅ 正確初始化 router

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('loginWithToken');
        if (!token) {
          console.warn('沒有 Token，跳轉到登入頁面');
          router.push('/login');
          return;
        }

        console.log('正在驗證用戶身份...');
        const res = await fetch('https://lenstudio.onrender.com/api/rental-master/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`API 錯誤: ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ 取得用戶資訊:', data);

        if (!data || data.user?.level === undefined) {
          console.error('❌ API 回傳錯誤，沒有 level 資訊', data);
          router.push('/');
          return;
        }

        setUser(data.user); // 🟢 設置正確的 user 資料

        if (data.user.level !== 99) {
          console.warn('⚠️ 權限不足，只有管理員 (Level 99) 才能進入此頁面，跳轉到 /');
          router.push('/');
        }
      } catch (error) {
        console.error('❌ 獲取用戶資訊失敗:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);


  // 📌 **篩選條件**
  const [filters, setFilters] = useState({
    category: '全部',
    advanced: [],
    brands: [],
  })

  // 上移動畫
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

  // 📌 **初始化時載入資料**
  useEffect(() => {
    fetchData()
    setCurrentPage(1) // 每次搜尋或篩選後自動跳回第一頁
  }, [filters, searchQuery])

  // 📌 **當 `filteredRentals` 或 `itemsPerPage` 變更時，重新計算 `totalPages`**
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredRentals.length / itemsPerPage)))
  }, [filteredRentals, itemsPerPage])

  // 📌 **RWD 視窗大小變更時，調整 `itemsPerPage`**
  useEffect(() => {
    const updateItemsPerPage = () => {
      // 📌 **計算當前頁面的第一個商品索引**，確保視窗變更後能保持當前商品可見。
      const indexOfFirstItem = (currentPage - 1) * itemsPerPage
      // 📌 **根據視窗大小動態設定 `itemsPerPage`**，以適應 RWD 的顯示需求。
      let newItemsPerPage

      if (window.innerWidth < 768) {
        newItemsPerPage = 6
      } else if (window.innerWidth < 992) {
        newItemsPerPage = 8
      } else {
        newItemsPerPage = 12
      }
      setItemsPerPage(newItemsPerPage)

      // 📌 **計算新的頁碼**，根據第一個商品的索引重新定位頁面，避免頁數錯位。
      const newPage = Math.floor(indexOfFirstItem / newItemsPerPage) + 1
      setCurrentPage(newPage)
    }

    updateItemsPerPage() // ✅ 初始化時立即執行
    // 📌 **監聽視窗大小變更事件**，在視窗大小變更時自動調整分頁顯示數量。
    window.addEventListener('resize', updateItemsPerPage)
    // 📌 **清除事件監聽器**，避免組件卸載時潛在的內存洩漏 (memory leak)。
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

      // 🚀 只發送一次 API
      const res = await fetch(`https://lenstudio.onrender.com/api/rental?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success) {
        setRentals(data.rentals) // 設定所有商品
        setFilteredRentals(data.rentals) // 預設顯示所有商品
        setHashtags(data.tags || []) // 確保標籤至少為空陣列
        setTotalPages(
          Math.max(1, Math.ceil(data.rentals.length / itemsPerPage))
        ) // 設定總頁數
      }
    } catch (error) {
      console.error('❌ 無法載入資料:', error)
    }
  }

  // 📌 **點擊 Hashtag 時，將 Hashtag 設定為搜尋關鍵字**
  const handleHashtagClick = (tag) => {
    setSearchQuery(tag) // ✅ 點擊標籤時，觸發搜尋
  }

  // 📌 **篩選變更時處理**
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // 重置到第一頁
  }

  // 📌 **商品排序功能**
  const sortedRentals = [...filteredRentals].sort((a, b) => {
    if (sorting === 'fee_asc') return a.fee - b.fee; // 價格由低到高
    if (sorting === 'fee_desc') return b.fee - a.fee; // 價格由高到低
    if (sorting === 'rating_desc') return b.average_rating - a.average_rating; // 評分高到低
    if (sorting === 'reviews_desc') return b.total_reviews - a.total_reviews; // 評論數量多到少
    return 0;
  });

  // 📌 **計算當前頁面的商品範圍**
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const visibleItems = sortedRentals.slice(indexOfFirstItem, indexOfLastItem)

  if (loading) return <p className="text-center mt-5">🚀 資料載入中...</p>

  if (!user || user.level !== 99) {
    return null; // 確保未授權用戶不會看到頁面內容
  }

  return (
    <div className="row">
      {/* 📌 側邊篩選功能 */}
      <aside className="col-0 col-md-4 col-lg-3 p-3" style={{ marginTop: '35px' }} >
        <hr className="d-none d-md-block" />
        <RentSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <RentHashtag hashtags={hashtags} onHashtagClick={handleHashtagClick} />
        <RentFilter onFilterChange={handleFilterChange} />
      </aside>

      {/* 📌 主要內容區域 */}
      <main className="col-12 col-md-8 col-lg-9">
        {/* 📌 總數 & 排序 */}
        <div className="d-flex justify-content-between align-items-center">
          <RentTotal
            totalItems={filteredRentals.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />
          <RentOrder setSorting={setSorting} />
        </div>

        {/* 📌 商品清單 */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2 mt-1">
          {visibleItems.map((rental) => (
            <RentCard
              key={rental.id}
              rental={{
                ...rental,
                rating: Number(rental.average_rating) || 0, // 確保 rating 是數字
                reviewsCount: rental.total_reviews || 0, // 確保評論數不為 null
              }}
              shouldAnimate={shouldAnimate} />
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
    </div >
  )
}
