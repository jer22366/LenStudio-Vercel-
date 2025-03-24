'use client'

import React, { useState, useEffect } from 'react'
import styles from './index.module.scss'
import Link from 'next/link'
import { FaRegHeart, FaHeart } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { jwtDecode } from 'jwt-decode' // 添加此導入

export default function TagLikeShareBtnIndex({ articleId, isAuthenticated, showAuthModal }) {
  const [tags, setTags] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [shareHovered, setShareHovered] = useState(false)
  const [shareActive, setShareActive] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [copyHovered, setCopyHovered] = useState(false)
  const [copyActive, setCopyActive] = useState(false)

  const [token, setToken] = useState(null)
  const [userId, setUserId] = useState(null) // 新增: 存儲當前用戶ID
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteHovered, setFavoriteHovered] = useState(false)

  // 在組件載入時獲取 token 和 userId
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('loginWithToken')
      if (storedToken) {
        setToken(storedToken)
        try {
          const decoded = jwtDecode(storedToken)
          setUserId(decoded.id) // 假設JWT中包含用戶ID
        } catch (error) {
          console.error('解析JWT失敗:', error)
        }
      }
    }
  }, [])

  // 獲取文章收藏狀態
  useEffect(() => {
    if (!token || !articleId) return;

    const checkFavoriteStatus = async () => {
      try {
        // 修改：增加錯誤處理和降級策略
        try {
          const res = await fetch(
            `https://lenstudio.onrender.com/api/articles/collection/${articleId}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include', // 確保包含身份驗證憑證
            }
          )

          if (res.ok) {
            const data = await res.json()
            setIsFavorite(!!data.isFavorite)
          } else {
            console.warn('收藏狀態獲取失敗，使用預設值')
            // 失敗時使用預設值，不影響使用者體驗
            setIsFavorite(false)
          }
        } catch (error) {
          console.error('收藏狀態獲取錯誤:', error)
          // 出錯時使用預設值，不影響使用者體驗
          setIsFavorite(false)
        }
      } catch (error) {
        console.error('無法確認收藏狀態:', error)
        // 不拋出錯誤，只記錄日誌
      }
    }

    checkFavoriteStatus()
  }, [articleId, token])

  // 檢查此用戶是否已為此文章點贊
  useEffect(() => {
    if (!token || !userId || !articleId) return;

    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`https://lenstudio.onrender.com/api/likes/check?userId=${userId}&articleId=${articleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('檢查點贊狀態失敗:', error);
      }
    };

    checkLikeStatus();
  }, [articleId, token, userId]);

  const fetchArticleLikeCount = async () => {
    try {
      const response = await fetch(`https://lenstudio.onrender.com/api/articles/${articleId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('完整的API響應結構:', result)

      // 正確處理嵌套的數據結構
      let count = 0;
      if (result.data && result.data.like_count !== undefined) {
        count = Number(result.data.like_count);
      } else if (result.like_count !== undefined) {
        count = Number(result.like_count);
      }

      console.log('處理後的點讚數:', count);
      setLikeCount(count);
    } catch (error) {
      console.error('Could not fetch article like count:', error)
    }
  }

  useEffect(() => {
    // 取得標籤
    const fetchTags = async () => {
      try {
        // 確保文章 ID 正確傳遞
        const response = await fetch(`/api/articles/${articleId}/tags`);
        console.log('標籤 API 響應:', response.status);
        
        // 其他代碼保持不變
      } catch (error) {
        console.error('獲取標籤失敗:', error);
        setTags([]); // 失敗時設置空數組
      }
    };

    // 現在可以直接調用上面定義的函數
    fetchArticleLikeCount();
    fetchTags();
  }, [articleId])

  // 修改處理點贊的函數，支持點贊和取消點贊
  const handleLike = async () => {
    if (!isAuthenticated || !token) {
      showAuthModal();
      return;
    }

    if (!userId) {
      console.error('無法獲取用戶ID');
      toast.error('操作失敗，請重新登入');
      return;
    }

    try {
      // 根據當前狀態決定操作
      const method = isLiked ? 'DELETE' : 'POST';
      const newLikeCount = isLiked ? Number(likeCount) - 1 : Number(likeCount) + 1;

      // 先更新UI，提供即時反饋
      setIsLiked(!isLiked);
      setLikeCount(newLikeCount);
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 300);

      // 修改這裡，使用絕對路徑
      const response = await fetch(`https://lenstudio.onrender.com/api/likes`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          likeableId: articleId,
          likeableType: 'article',
          newLikeCount,
          userId,
        }),
        credentials: 'include', // 添加此項以包含 cookies
      });

      // 新增：在操作成功後重新獲取最新資料
      if (response.ok) {
        fetchArticleLikeCount(); // 重新獲取最新的點讚數
      }

      // 其他代碼保持不變...
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('操作失敗，請稍後再試', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // 處理收藏點擊
  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated && !token) {
      // 不再使用 toast，而是調用 showAuthModal 函數
      showAuthModal();
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      let url = 'https://lenstudio.onrender.com/api/articles/collection'

      if (method === 'DELETE') {
        url = `https://lenstudio.onrender.com/api/articles/collection/${articleId}`
      }

      // 先更新UI狀態，提供即時反饋
      setIsFavorite(!isFavorite)

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 確保包含身份驗證憑證
        body:
          method === 'POST' ? JSON.stringify({ article_id: articleId }) : null,
      })

      if (!res.ok) {
        // 如果API調用失敗，恢復原始狀態
        setIsFavorite(isFavorite)
        const errorText = await res.text()
        throw new Error(errorText || '收藏操作失敗')
      }

      toast.success(isFavorite ? '已取消收藏！' : '成功加入收藏！', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (error) {
      console.error('收藏錯誤:', error)
      // 已經在上面恢復了狀態，只需顯示錯誤訊息
      toast.error('操作失敗：' + (error.message || '發生錯誤，請稍後再試'), {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  // 分享按鈕點擊事件：彈出一個置中 overlay 並提供複製網址功能
  const handleShare = () => {
    setShowSharePopup(true)
  }

  return (
    <>
      <div
        className={`d-flex justify-content-between align-items-center ${styles['y-tag-like-comment-share-fav-area']}`}
      >
        <div className={`${styles['y-tag-area']}`}>
          {tags.map((tag, index) => (
            <Link
              key={index}
              href={`/article?tag=&search=%23${tag.tag_name.replace('#', '')}`}
              className="text-decoration-none"
            >
              <button className="py-sm-1 px-sm-3 ms-sm-1 fw-medium rounded-pill">
                {tag.tag_name}
              </button>
            </Link>
          ))}
        </div>
        <div className={`${styles['y-like-comment-share-fav']} d-flex`}>
          {/* Like 按鈕 */}
          <button
            className="py-sm-2 px-sm-2 d-flex align-items-center fw-medium rounded-pill"
            onClick={handleLike}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={
                isLiked
                  ? '/images/article/thumb-up-red.svg'
                  : isHovered
                    ? '/images/article/thumb-up-gray.svg'
                    : '/images/article/thumb-up-black.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-pc']}`}
              style={{
                transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
              alt="Like"
            />
            {/* 電腦版數字 */}
            <span
              className={`${styles['y-count-num-pc']}`}
            >{`${likeCount}`}</span>
            <img
              src={
                isLiked
                  ? '/images/article/thumb-up-red.svg'
                  : isHovered
                    ? '/images/article/thumb-up-gray.svg'
                    : '/images/article/thumb-up-black.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-mb']}`}
              style={{
                transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
              alt="Like"
            />
            <span className={`${styles['y-count-num']}`}>{`${likeCount}`}</span>
          </button>

          {/* Share 按鈕 */}
          <button
            className="py-sm-2 px-sm-2 d-flex align-items-center fw-medium rounded-pill"
            onClick={handleShare}
            onMouseEnter={() => setShareHovered(true)}
            onMouseLeave={() => {
              setShareHovered(false)
              setShareActive(false)
            }}
            onMouseDown={() => setShareActive(true)}
            onMouseUp={() => setShareActive(false)}
          >
            <img
              src={
                shareActive
                  ? '/images/article/share-active.svg'
                  : shareHovered
                    ? '/images/article/share-hover.svg'
                    : '/images/article/share-origin.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-pc']}`}
              alt="Share"
            />
            <img
              src={
                shareActive
                  ? '/images/article/share-active.svg'
                  : shareHovered
                    ? '/images/article/share-hover.svg'
                    : '/images/article/share-origin.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-mb']}`}
              alt="Share"
            />
          </button>

          {/* 修改後的收藏按鈕，使用 FavoriteButtonG 的樣式 */}
          <button
            onClick={handleFavoriteClick}
            className={`${styles['favorite-btn']} ${styles['article-favorite-btn']}`}
            onMouseEnter={() => setFavoriteHovered(true)}
            onMouseLeave={() => setFavoriteHovered(false)}
          >
            {isFavorite ? (
              <FaHeart color="#d0b088" size={18} className={styles['favorite-icon']} />
            ) : (
              <FaRegHeart
                size={18}
                color={favoriteHovered ? "#838383" : "#1E3C54"}
                className={styles['favorite-icon']}
              />
            )}
          </button>
        </div>
      </div>

      {showSharePopup && (
        <div
          onClick={() => setShowSharePopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          {/* 點擊白色區域不會關閉 popup */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '70px',
              borderRadius: '15px',
              textAlign: 'center',
              width: '600px', // 框變長一些
            }}
          >
            <h5>複製以下網址分享</h5>
            <div
              style={{
                position: 'relative',
                width: '100%',
                margin: '20px auto',
              }}
            >
              <input
                type="text"
                readOnly
                value={window.location.href}
                style={{
                  width: '100%',
                  padding: '5px 50px 5px 10px', // 預留右側空間給複製按鈕
                  borderRadius: '10px',
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setCopyActive(true)
                  setTimeout(() => setCopyActive(false), 5000)
                }}
                onMouseEnter={() => setCopyHovered(true)}
                onMouseLeave={() => setCopyHovered(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {(copyHovered || copyActive) && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '120%', // 顯示在按鈕正上方
                      right: 0,
                      background: '#7E7267',
                      color: 'white',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copyActive ? '已複製' : '複製'}
                  </div>
                )}
                <img
                  src={
                    copyActive
                      ? '/images/article/copy-active.svg'
                      : copyHovered
                        ? '/images/article/copy-hover.svg'
                        : '/images/article/copy-origin.svg'
                  }
                  alt="複製"
                  style={{ height: '70%' }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
