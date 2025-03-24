"use client"

import { useEffect, useRef } from 'react'
import useAuthHook from '@/hooks/use-auth'
import SliderIndex from './_components/slider'
import ArticleCardIndex from './_components/article-card'
import ProductCardIndex from './_components/product-card'
import CoursesCardIndex2 from './_components/courses-card2'
import Chat from './_components/chat'
import CouponButton from './_components/getCoupon/page'

// 定義各區域的背景顏色
const SLIDER_COLOR = [245, 245, 247] // 淺灰色 (RGB)
const ARTICLE_COLOR = [255, 255, 255] // 白色 (RGB)
const PRODUCT_COLOR = [20, 49, 70]   // 深藍色 (RGB)
const COURSE_COLOR = [56, 96, 128]

// 顏色插值函數 - 用於平滑過渡
function interpolateColor(color1, color2, factor) {
  // 使用三次曲線使過渡更自然
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smoothFactor = easeInOutCubic(factor);

  const result = color1.map((channel, i) => {
    return Math.round(channel + smoothFactor * (color2[i] - channel));
  });
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// 節流函數 - 對於快速滾動更合適
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export default function Home() {
  const sliderRef = useRef(null);
  const articleRef = useRef(null);
  const productRef = useRef(null);
  const courseRef = useRef(null);
  const bgOverlayRef = useRef(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // 創建背景覆蓋層
    const overlay = document.createElement('div');
    overlay.id = 'background-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background-color: rgb(${SLIDER_COLOR.join(',')});
      transition: background-color 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    bgOverlayRef.current = overlay;

    // 滾動監聽處理函數 - 處理所有區域的過渡
    const handleScroll = () => {
      // 確保所有區域都已經載入
      if (!sliderRef.current || !articleRef.current || !productRef.current || !courseRef.current) return;

      const scrollY = window.scrollY;
      const viewHeight = window.innerHeight;

      // 獲取所有區域的位置信息
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const articleRect = articleRef.current.getBoundingClientRect();
      const productRect = productRef.current.getBoundingClientRect();
      const courseRect = courseRef.current.getBoundingClientRect();

      // 計算各區域的中心位置
      const sliderCenter = sliderRect.top + scrollY + sliderRect.height / 2;
      const articleCenter = articleRect.top + scrollY + articleRect.height / 2;
      const productCenter = productRect.top + scrollY + productRect.height / 2;
      const courseCenter = courseRect.top + scrollY + courseRect.height / 2;

      // 定義各過渡區間
      const sliderToArticleStart = sliderCenter - viewHeight * 0.8;
      const sliderToArticleEnd = articleCenter - viewHeight * 0.2;

      const articleToProductStart = articleCenter - viewHeight * 0.8;
      const articleToProductEnd = productCenter - viewHeight * 0.2;

      const productToCourseStart = productCenter - viewHeight * 0.8;
      const productToCourseEnd = courseCenter - viewHeight * 0.2;

      // 檢測滾動方向 - 對於快速滾動優化過渡
      const isScrollingDown = scrollY > lastScrollYRef.current;
      lastScrollYRef.current = scrollY;

      // 根據滾動方向調整過渡速度
      const transitionDuration = isScrollingDown ? '1.0s' : '0.8s';
      bgOverlayRef.current.style.transition = `background-color ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)`;

      // 根據滾動位置設置顏色
      let backgroundColor;

      // 滑塊到文章區過渡
      if (scrollY >= sliderToArticleStart && scrollY <= sliderToArticleEnd) {
        const progress = (scrollY - sliderToArticleStart) / (sliderToArticleEnd - sliderToArticleStart);
        backgroundColor = interpolateColor(SLIDER_COLOR, ARTICLE_COLOR, progress);
      }
      // 文章區到產品區過渡
      else if (scrollY >= articleToProductStart && scrollY <= articleToProductEnd) {
        const progress = (scrollY - articleToProductStart) / (articleToProductEnd - articleToProductStart);
        backgroundColor = interpolateColor(ARTICLE_COLOR, PRODUCT_COLOR, progress);
      }
      // 產品區到課程區過渡
      else if (scrollY >= productToCourseStart && scrollY <= productToCourseEnd) {
        const progress = (scrollY - productToCourseStart) / (productToCourseEnd - productToCourseStart);
        backgroundColor = interpolateColor(PRODUCT_COLOR, COURSE_COLOR, progress);
      }
      // 在滑塊區之前
      else if (scrollY < sliderToArticleStart) {
        backgroundColor = `rgb(${SLIDER_COLOR.join(',')})`;
      }
      // 在文章區與產品區之間
      else if (scrollY < articleToProductStart) {
        backgroundColor = `rgb(${ARTICLE_COLOR.join(',')})`;
      }
      // 在產品區與課程區之間
      else if (scrollY < productToCourseStart) {
        backgroundColor = `rgb(${PRODUCT_COLOR.join(',')})`;
      }
      // 在課程區之後
      else {
        backgroundColor = `rgb(${COURSE_COLOR.join(',')})`;
      }

      // 更新背景顏色
      bgOverlayRef.current.style.backgroundColor = backgroundColor;
    };

    // 使用節流處理滾動事件，而非防抖 - 更適合快速滾動
    const throttledScroll = throttle(handleScroll, 16); // 約 60fps
    window.addEventListener('scroll', throttledScroll);

    // 初始化時執行一次
    setTimeout(handleScroll, 300);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (bgOverlayRef.current && document.body.contains(bgOverlayRef.current)) {
        document.body.removeChild(bgOverlayRef.current);
      }
    };
  }, []);

  return (
    <main>
      <div ref={sliderRef}>
        <SliderIndex />
      </div>
      <div ref={articleRef} style={{ padding: '80px 0' }}>
        <ArticleCardIndex />
      </div>
      <div ref={productRef} >
        <ProductCardIndex />
      </div>
      <CouponButton />
      <div ref={courseRef} >
        <CoursesCardIndex2 />
      </div>
      <Chat />
    </main>
  )
}