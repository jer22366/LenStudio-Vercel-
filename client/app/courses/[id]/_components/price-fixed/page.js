'use client'

import { useState, useEffect } from 'react'
import styles from './price-filxed.module.scss'
import FavoriteButtonG from '../favorite-button-g/page'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export default function PriceFixed({ course }) {
  const [isVisible, setIsVisible] = useState(false)
  const [cart, setCart] = useState([])

  // 頁面載入時，從 `localStorage` 讀取購物車資料
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('shoppingCart')
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    }
  }, [])

  const router = useRouter()

  //立即購買
  const handleBuyNow = () => {
    const token = localStorage.getItem('loginWithToken')

    if (!token) {
      toast.warn('請先登入，即可結帳！', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    let updatedCart = [...cart]

    // 檢查購物車是否已經有該課程
    const existingItemIndex = updatedCart.findIndex(
      (item) => item.id === course.id
    )

    if (existingItemIndex === -1) {
      // 如果沒有該課程，則新增
      updatedCart.push({
        id: course.id,
        title: course.title,
        price: course.sale_price,
        image: course.image_url,
        quantity: 1,
      })
      localStorage.setItem('shoppingCart', JSON.stringify(updatedCart))
      setCart(updatedCart)
    }

    // ✅ 觸發購物車更新
    window.dispatchEvent(new Event('cartUpdated'))
    router.push('/cart')
  }

  // 加入購物車
  const handleAddToCart = () => {
    const token = localStorage.getItem('loginWithToken') //

    if (!token) {
      // 未登入，顯示警告並阻止加入購物車
      toast.warn('請先登入，即可選購課程！', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    const updatedCart = [...cart]

    // 檢查購物車是否已經有該課程
    const existingItemIndex = updatedCart.findIndex(
      (item) => item.id === course.id
    )

    if (existingItemIndex === -1) {
      // 如果沒有該課程，則新增
      updatedCart.push({
        id: course.id,
        title: course.title,
        price: course.sale_price,
        image: course.image_url,
        quantity: 1,
      })

      // 更新 `localStorage`
      localStorage.setItem('shoppingCart', JSON.stringify(updatedCart))
      setCart(updatedCart)

      // 顯示成功提示
      toast.success('已加入購物車！', {
        position: 'top-right',
        autoClose: 2000,
      })
    } else {
      // 如果該課程已經在購物車中，顯示提示
      toast.warn('此課程已在購物車內！', {
        position: 'top-right',
        autoClose: 2000,
      })
    }
    // ✅ 觸發購物車更新
    window.dispatchEvent(new Event('cartUpdated'))
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1200) {
        setIsVisible(true) // 手機版強制顯示
        return
      }

      const priceSection = document.querySelector(
        `.${styles['course-price-fixed']}`
      )
      const contentSection = document.querySelector('.col-12.col-xl-8') // 左側內容區

      if (!priceSection || !contentSection) return

      const priceRect = priceSection.getBoundingClientRect()
      const contentRect = contentSection.getBoundingClientRect()

      // **當 `PriceFixed` 距離視窗頂部 150px 時顯示**
      const appearThreshold = 500

      // **如果 `PriceFixed` 的 `top` <= `appearThreshold`，讓它顯示**
      const shouldShow = priceRect.top <= appearThreshold

      // **維持底部隱藏邏輯**
      const shouldHide = priceRect.bottom >= contentRect.bottom

      setIsVisible(shouldShow && !shouldHide)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`${styles['course-price-fixed']} ${
        isVisible ? styles['show'] : styles['hide']
      }`}
    >
      <div className={styles['fixed-price']}>
        <div className={styles['discount-price']}>
          NT$ {course.sale_price.toLocaleString()}
        </div>
        <div className={styles['original-price']}>
          NT$ {course.original_price.toLocaleString()}
        </div>
      </div>
      <div className={styles['shopping-btn-fixed']}>
        <button className={styles['buy-btn']} onClick={handleBuyNow}>
          + 立即購買
        </button>
        <div className={styles['shopping-btn-flex']}>
          <button
            className={`${styles['cart-btn']}`}
            onClick={handleAddToCart}
          >
            <img src="/images/icon/cart-btn.svg" alt="加入購物車" />
            <p>加入購物車</p>
          </button>
          <FavoriteButtonG
            className={styles['favorite-btn']}
            courseId={course.id}
          />
        </div>
        <div className={styles['refund']}>
          <p>30 天退款保證</p>
        </div>
        <div className={styles['fixed-content']}>
          <div className={styles['content-title']}>此課程包含</div>
          <div className={styles['line']}></div>
          <ul className={styles['content-text']}>
            <li>
              <img src="/images/icon/fixed_icon_1.svg" alt="" />
              {Math.floor(course.duration / 60)} 小時 {course.duration % 60}{' '}
              分鐘的影片
            </li>
            <li>
              <img src="/images/icon/fixed_icon_2.svg" alt="" />4 個可下載的資源
            </li>
            <li>
              <img src="/images/icon/fixed_icon_3.svg" alt="" />
              透過行動裝置與電視存取
            </li>
            <li>
              <img src="/images/icon/fixed_icon_4.svg" alt="" />
              完整終身存取權
            </li>
            <li>
              <img src="/images/icon/fixed_icon_5.svg" alt="" />
              結業證書
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
