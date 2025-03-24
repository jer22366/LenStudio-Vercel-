'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
// 修改這裡：引入 usePublicAuth 替代 useAuth
import usePublicAuth from '@/hooks/usePublicAuth'
import Swal from 'sweetalert2'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import styles from './index.module.scss'

// 初始化 GiphyFetch 實例
const gf = new GiphyFetch('6Jxrd3sSeXRfaOs952JGsXJYC5uIASsC')

// 錯誤邊界組件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    console.error('Error captured in ErrorBoundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Detailed error info:', errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>發生錯誤，請稍後再試。</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>詳細錯誤資訊</summary>
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

// 主組件
export default function ReplyInput({ articleId, parentId, onCommentSubmitted, replyTo, isAuthenticated, showAuthModal }) {
  // 修改這裡：使用 usePublicAuth 替代 useAuth
  const { token, user } = usePublicAuth()
  const router = useRouter()

  // 1. 先定義所有 state hooks，確保順序正確
  const [comment, setComment] = useState(replyTo || '') // 留言文字
  const [previews, setPreviews] = useState([]) // 圖片和 GIF 預覽
  const [showGifPicker, setShowGifPicker] = useState(false) // 是否顯示 GIF 選擇器
  const [searchTerm, setSearchTerm] = useState('') // GIF 搜尋用的關鍵字
  const [isHovered, setIsHovered] = useState(false) // 新增 hover state
  const [isSent, setIsSent] = useState(false) // 是否已送出
  const [containerWidth, setContainerWidth] = useState(0);
  const [isGifPickerReady, setIsGifPickerReady] = useState(false);

  // 2. 定義所有 ref hooks
  const fileInputRef = useRef(null) // 文件上傳輸入框的參考引用
  const gifContainerRef = useRef(null);

  // 3. 然後再使用 useEffect 等其他 hooks
  // 添加監聽容器寬度的 effect
  useEffect(() => {
    if (showGifPicker && gifContainerRef.current) {
      setContainerWidth(gifContainerRef.current.offsetWidth);
      setIsGifPickerReady(true);

      const resizeObserver = new ResizeObserver(entries => {
        setContainerWidth(entries[0].contentRect.width);
      });

      resizeObserver.observe(gifContainerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    } else if (!showGifPicker) {
      // 重置狀態，確保下次顯示時重新計算
      setIsGifPickerReady(false);
    }
  }, [showGifPicker]); // 依賴 showGifPicker，確保每次顯示時都重新計算

  // 如果父層切換了 replyTo，需要同步更新
  useEffect(() => {
    setComment(replyTo || '')
  }, [replyTo])

  // 文件改變
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    let selectedFiles = []
    const videoFiles = files.filter((file) => file.type.startsWith('video'))
    if (videoFiles.length > 0) {
      selectedFiles = [videoFiles[0]]
    } else {
      const imageFiles = files.filter((file) => file.type.startsWith('image'))
      if (imageFiles.length > 0) {
        selectedFiles = [imageFiles[0]]
      }
    }

    const previewURLs = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }))
    setPreviews(previewURLs)
  }

  // 觸發文件上傳
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 移除圖片/影片預覽
  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // 處理 GIF 選擇
  const handleGifSelect = (gif) => {
    setPreviews([{ url: gif.images.original.url, type: 'gif' }])
    setShowGifPicker(false)
  }

  // 留言送出
  const handleSubmit = async (e) => {
    // 確保 e 存在並且有 preventDefault 方法
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // 如果用戶未登入，顯示登入 Modal
    if (!isAuthenticated && !token) {
      showAuthModal();
      return;
    }

    // 如果沒有文字內容且沒有檔案，則不處理
    if (!comment.trim() && previews.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('content', comment);
      formData.append('articleId', articleId);
      // 利用 token 取得當前登入的 user_id
      formData.append('userId', user?.id);
      formData.append('parentId', parentId || '');

      // 處理預覽中的媒體檔案
      if (previews.length > 0) {
        const preview = previews[0]; // 因為我們限制只能上傳一個檔案
        if (preview.type === 'gif') {
          // 如果是 GIF，傳送 URL
          formData.append('gifUrl', preview.url);
        } else {
          // 如果是圖片或影片，傳送檔案
          const file = fileInputRef.current.files[0];
          if (file) {
            formData.append('media', file);
          }
        }
      }

      const response = await fetch('https://lenstudio.onrender.com/api/comments', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.status === 'success') {
        // 清空表單...
        setComment('');
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // 執行送出成功後按鈕放大效果
        setIsSent(true);
        setTimeout(() => setIsSent(false), 300);

        // 確保返回完整數據結構，特別是 content 欄位
        const completeData = {
          ...data.data,
          content: data.data.content, // 確保內容欄位存在
          id: data.data.id,
          // 其他必要欄位...
        };

        onCommentSubmitted && onCommentSubmitted(completeData);
      } else {
        alert(data.message || '發送失敗');
      }
    } catch (error) {
      console.error('留言提交錯誤:', error);
      alert('發送失敗，請稍後再試');
    }
  };

  // 根據是否有文字或預覽判定是否可發送
  const isReadyToSend = comment.trim().length > 0 || previews.length > 0

  // 設定發送按鈕圖示，條件為是否可發送以及是否 hover
  const sendIcon = isReadyToSend
    ? isHovered
      ? '/images/article/sended-hover.svg'
      : '/images/article/sended.svg'
    : isHovered
      ? '/images/article/sended-hover.svg'
      : '/images/article/sended-black.svg'

  // GEO API 請求搜尋 GIF
  const searchGifs = useCallback(
    async (offset) => {
      try {
        if (!searchTerm.trim()) {
          return await gf.trending({ offset, limit: 10 })
        } else {
          return await gf.search(searchTerm.trim(), { offset, limit: 10 })
        }
      } catch (error) {
        console.error('Error fetching GIFs:', error)
        return { data: [] } // 必須返回空結果以防止 Grid 錯誤
      }
    },
    [searchTerm]
  )

  function handleSearch() {
    // 直接呼叫 this.searchGifs 相關邏輯
    console.log('執行搜尋邏輯：', searchTerm)
    // 或者 setGifResult(...) 執行 UI 更新等
  }

  // 如果用戶未登入，直接顯示登入按鈕而不是輸入框
  if (!isAuthenticated && !token) {
    return (
      <div className={`p-3 bg-white border border-secondary ${styles['y-comment-area']}`}>
        <div className="text-center py-3">
          <p className="mb-3">登入後才能發表評論</p>
          <button
            className={`btn ${styles['btn-needs-login']}`}
            onClick={showAuthModal} // 正確用法，直接傳遞函數引用而不是調用
          >
            立即登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-white border border-secondary ${styles['y-comment-area']}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <img
          src={user?.head || "/images/user.png"}
          alt="用戶頭像"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid #ddd'
          }}
        />

        <input
          type="text"
          id="comment"
          className={`p-2 py-3 ${styles['comment-input-responsive']}`}
          placeholder="我有話想說...."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            // 修改這裡，只要按 Enter 鍵就發送 (不需要 Ctrl 或 Cmd)
            if (e.key === 'Enter' && !e.shiftKey) { // 如果按住 Shift 則不發送
              e.preventDefault(); // 防止換行
              handleSubmit(e);
            }
          }}
          style={{
            fontWeight: comment.trim().startsWith('@') ? 700 : 'normal'
          }}
        />
      </div>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div
        className={`mt-2 d-flex justify-content-end ${styles['y-comment-area-icons']}`}
      >
        <div className="d-flex">
          <button className="p-1 action-btn image-btn" onClick={triggerFileInput}>
            <img
              src="/images/article/imageup-b.svg"
              alt="圖/影"
              className={styles['imageup-icon']}
            />
          </button>
          <button
            className="p-1 action-btn gif-btn"
            onClick={() => setShowGifPicker(!showGifPicker)}
          >
            <img
              src="/images/article/gif-icon-b.svg"
              alt="選擇 GIF"
              className={showGifPicker ? styles.active : ''}
            />
          </button>
          <button
            className="p-1 action-btn send-btn sendIcon"
            style={{ transition: 'transform 0.3s ease', transform: isSent ? 'scale(1.5)' : 'scale(1)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleSubmit}
          >
            <img src={sendIcon} alt="發送" />
          </button>
        </div>
      </div>
      {previews.length > 0 && (
        <div className={styles['preview-container']}>
          {previews.map((file, index) => (
            <div
              key={index}
              className={styles['preview-item']}
            >
              {file.type.startsWith('image') ? (
                <img
                  src={file.url}
                  alt={`預覽-${index}`}
                  className={styles['preview-media']}
                />
              ) : file.type === 'gif' ? (
                <img
                  src={file.url}
                  alt={`預覽-${index}`}
                  className={styles['preview-media']}
                />
              ) : (
                <video
                  src={file.url}
                  className={styles['preview-media']}
                  controls
                />
              )}
              <div
                onClick={() => removePreview(index)}
                className={styles['preview-remove-btn']}
              >
                <span>✕</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showGifPicker && (
        <div style={{ width: '100%', marginTop: '1rem' }}>
          <ErrorBoundary>
            <input
              type="text"
              value={searchTerm}
              placeholder="搜尋 GIF"
              className="mb-2 border border-dark py-2 rounded ps-2"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', margin: '0 auto', display: 'block' }}
            />
            <div
              ref={gifContainerRef}
              style={{
                position: 'relative',
                width: '100%',
                height: '600px',
                overflowY: 'auto',
                overflowX: 'hidden',
                margin: '0 auto'
              }}
            >
              {isGifPickerReady && (
                <Grid
                  fetchGifs={searchGifs}
                  key={searchTerm}
                  width={containerWidth} // 不再需要默認值，因為已確保寬度正確計算
                  columns={containerWidth < 576 ? 2 : 3}
                  gutter={6}
                  onGifClick={(gif, e) => {
                    e.preventDefault()
                    handleGifSelect(gif)
                  }}
                />
              )}
            </div>
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}

export function NestedReplyInput({ articleId, parentId, onCommentSubmitted, isAuthenticated, showAuthModal }) {
  // 檢查登入
  if (!isAuthenticated) {
    return (
      <div className={`p-3 bg-white border border-secondary ${styles['y-comment-area']}`}>
        <div className="text-center py-3">
          <p className="mb-3">登入後才能發表評論</p>
          <button
            className={`btn ${styles['btn-needs-login']}`}
            onClick={showAuthModal} // 注意這裡不要調用函數，而是直接傳遞
          >
            立即登入
          </button>
        </div>
      </div>
    );
  }

  const [comment, setComment] = useState('')
  const fileInputRef = useRef(null)
  const userId = 1 // 這裡可改為動態取得

  // 確保在送出資料中正確設定 articleId 與 parentId
  const handleSubmit = async (e) => {
    // 確保 e 存在並且有 preventDefault 方法
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (!comment.trim()) return

    const formData = new FormData()
    formData.append('content', comment)
    formData.append('articleId', articleId)  // 這裡 articleId 應該來自當前文章的 id
    formData.append('userId', userId)
    formData.append('parentId', parentId)      // 這裡 parentId 是回覆中回覆所對應的留言 id

    try {
      const response = await axios.post(
        'https://lenstudio.onrender.com/api/comments',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      // 清空輸入框，並呼叫父組件的 callback
      setComment('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      onCommentSubmitted && onCommentSubmitted(response.data)
    } catch (error) {
      console.error('Nested reply submission failed:', error)
    }
  }

  return (
    <div className={`p-3 bg-white border border-secondary ${styles['y-comment-area']}`}>
      <input
        type="text"
        placeholder="請輸入回覆"
        className="p-2 py-3"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e); // 確保傳遞事件對象
          }
        }}
      />
      {/* 如果需要檔案上傳，也可以加入 <input type="file" ... /> */}
      <button onClick={handleSubmit}>送出回覆</button>
      {nestedReplies && nestedReplies.length > 0 && (
        <>
          <div className={`my-3 ${styles['y-hidden-reply-btn']}`}>
            <button>ㄧ 隱藏留言</button>
          </div>
          {nestedReplies.map((reply, idx) => {
            if (!reply) return null;
            return (
              <NestedReplyItem
                key={`nested-${reply.id}-${idx}`}
                userName={reply?.nickname || reply?.name}
                userProfile={reply?.head}
                text={reply?.content}
                time={reply?.created_at}
                image={reply?.media_url}
                parentId={reply?.parent_id}
              />
            )
          })}
          <div className={`my-3 ${styles['y-hidden-reply-btn']}`}>
            <button>ㄧ 隱藏留言</button>
          </div>
        </>
      )}
    </div>
  )
}
