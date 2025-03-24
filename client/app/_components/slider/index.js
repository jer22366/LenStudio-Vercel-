'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'  // 導入 useRouter
import styles from './Slider.module.scss'

// 圖片和對應的字卡內容
const slides = [
  {
    image: "images/HomePage-images/Q3-43.webp",
    title: "Leica Q3 43",
    description: "如你所見"
  },
  {
    image: "images/HomePage-images/Leica_M11_Glossy_home_3840x2160.jpg.webp",
    title: "Leica M11 Glossy",
    description: "一見傾心"
  },
]

export default function SliderIndex() {
  const router = useRouter()  // 初始化 router
  const [currentIndex, setCurrentIndex] = useState(0)
  const sliderContainerRef = useRef(null)
  const parallaxElementsRef = useRef([])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // 視差滾動效果
  useEffect(() => {
    const handleScroll = () => {
      if (!sliderContainerRef.current) return

      const scrollY = window.scrollY
      const sliderRect = sliderContainerRef.current.getBoundingClientRect()
      const sliderHeight = sliderContainerRef.current.offsetHeight
      const viewportHeight = window.innerHeight

      // 當滑塊在視窗中時才應用效果
      if (sliderRect.bottom > 0 && sliderRect.top < viewportHeight) {
        // 計算滾動比例 (0 到 1)
        const scrollProgress = Math.min(scrollY / sliderHeight, 1)

        // 設置縮放效果，限制最小縮放比例為 0.95
        const scale = Math.max(0.98, 1 - scrollProgress * 0.02)
        document.documentElement.style.setProperty('--parallax-scale', `${scale}`)

        // 應用視差效果只到圖片元素，文字和按鈕不受影響
        parallaxElementsRef.current.forEach(element => {
          if (element && element.classList.contains(styles.slideImage)) {
            // 只對圖片應用視差效果
            element.style.transform = `translateY(${scrollY * 0.05}px) scale(${scale})`
          }
          // 移除對文字卡片的視差效果，讓它們保持不動
        })
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 處理按鈕點擊事件
  const handleExploreClick = () => {
    router.push('/product')
  }

  return (
    <div className={styles.sliderContainer} ref={sliderContainerRef}>
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`${styles.slideItem} ${index === currentIndex ? styles.active : ""}`}
        >
          <img
            ref={el => {
              if (el) parallaxElementsRef.current[index] = el
            }}
            src={slide.image}
            className={`${styles.slideImage} ${styles.parallaxSlow}`}
            alt={`Slide ${index + 1}`}
          />
          <div
            className={styles.textCard}
          >
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
            <button 
              className={styles.slideButton}
              onClick={handleExploreClick}
            >
              <span>探索詳情</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
