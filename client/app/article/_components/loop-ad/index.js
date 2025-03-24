'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import style from './index.module.scss'
import { useRouter } from 'next/navigation'

export default function LoopAd() {
  const videoRef = useRef(null)
  const backgroundRef = useRef(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [ads, setAds] = useState([]) // 儲存廣告資料陣列
  const [currentAdIndex, setCurrentAdIndex] = useState(0) // 目前顯示的廣告索引
  const router = useRouter()

  useEffect(() => {
    const fetchAdsData = async () => {
      try {
        const response = await fetch('https://lenstudio.onrender.com/api/product/ads')
        if (!response.ok) {
          console.error(`API 請求失敗，狀態碼：${response.status}`)
          const text = await response.text()
          console.error('API 回應內容:', text)
          throw new Error(`API 請求失敗，狀態碼：${response.status}`)
        }
        const data = await response.json()
        console.log('取得的廣告資料:', data)
        setAds(data)
      } catch (error) {
        console.error('Error fetching ads data:', error)
      }
    }
    fetchAdsData()
  }, [])

  const generateThumbnail = () => {
    if (!ads[currentAdIndex]) return
    const video = videoRef.current
    if (video) {
      const onLoadedMetadata = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        const seekHandler = () => {
          console.log('Seeked event triggered')
          video.removeEventListener('seeked', seekHandler)
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg')
          console.log('Thumbnail generated:', dataUrl)
          setThumbnail(dataUrl)
        }
        video.addEventListener('seeked', seekHandler)
        video.currentTime = 8
      }
      video.addEventListener('loadedmetadata', onLoadedMetadata)
    }
  }

  useEffect(() => {
    if (videoRef.current && ads.length > 0) {
      generateThumbnail()
    }
  }, [videoRef.current, ads, currentAdIndex])

  const handleAdClick = () => {
    if (!ads[currentAdIndex]) return
    const productId = ads[currentAdIndex].product_id
    router.push(`/product/${productId}`)
  }

  // 無論 ads 是否有資料都呼叫以下 Hooks
  const currentAd = ads.length > 0 ? ads[currentAdIndex] : {}

  const handleVideoEnded = useCallback(() => {
    // 影片播完切換到下一個廣告，播到最後再循環回第一個
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % (ads.length || 1))
  }, [ads.length])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load() // 重新載入影片以確保從頭播放
    }
  }, [currentAdIndex])

  useEffect(() => {
    const setBackgroundHeight = () => {
      if (videoRef.current && backgroundRef.current) {
        const videoHeight = videoRef.current.offsetHeight
        setTimeout(() => {
          backgroundRef.current.style.height = `${videoHeight}px`
        }, 0)
      }
    }

    // 初始設定
    setBackgroundHeight()

    // 監聽視窗大小變化，以便在響應式佈局中更新高度
    window.addEventListener('resize', setBackgroundHeight)

    // 清除監聽器
    return () => {
      window.removeEventListener('resize', setBackgroundHeight)
    }
  }, [])

  useEffect(() => {
    const setContainerHeight = () => {
      if (videoRef.current) {
        const videoHeight = videoRef.current.offsetHeight
        // 直接操作 DOM 元素設定高度
        document.querySelector(
          `.${style['y-loop-ad-container']}`
        ).style.height = `${videoHeight}px`
      }
    }

    // 初始設定
    setContainerHeight()

    // 監聽視窗大小變化，以便在響應式佈局中更新高度
    window.addEventListener('resize', setContainerHeight)

    // 清除監聽器
    return () => {
      window.removeEventListener('resize', setContainerHeight)
    }
  }, [])

  return (
    <div className={style['y-loop-ad-container']}>
      {ads.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <>
          <div
            className={style['y-loop-ad-background']}
            ref={backgroundRef} // 取得背景元素的引用
            style={
              thumbnail
                ? { backgroundImage: `url(${thumbnail})`, filter: 'blur(8px)' }
                : {}
            }
          ></div>
          <div className={style['y-loop-ad']} onClick={handleAdClick}>
            <video
              ref={videoRef} // 取得影片元素的引用
              autoPlay
              muted
              onEnded={handleVideoEnded}
            >
              {currentAd?.video_url && (
                <source src={currentAd.video_url} type="video/mp4" />
              )}
            </video>
          </div>
        </>
      )}
    </div>
  )
}
