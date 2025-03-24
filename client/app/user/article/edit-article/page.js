'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'bootstrap/dist/css/bootstrap.min.css'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '../add-article/AddArticleModal.module.scss'
import BackSelectTitle from '../add-article/back-select-title'
import ImageUpdate from './imageUpdate'
import EditHashtagInput from './EditHashtagInput'
import EditButtonGroup from './EditButtonGroup'
import Sidenav from '../../_components/Sidenav/page'
import { checkRequiredFields } from '../add-article/page'
// 引入共用彈窗配置
import { errorAlert, successAlert, autoCloseAlert } from '@/utils/sweetAlertConfig'

const FroalaEditor = dynamic(() => import('../add-article/froalaEditor'), { ssr: false })

export default function EditArticlePage() {
  const [hasError, setHasError] = useState(false)
  const [articleData, setArticleData] = useState(null)
  const [hashtags, setHashtags] = useState([])
  const [editorReady, setEditorReady] = useState(false) // 新增: 監控編輯器狀態
  const [currentImagePath, setCurrentImagePath] = useState('');
  const imageUpdateRef = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const articleId = searchParams.get('id')

  // 監聽編輯器初始化
  useEffect(() => {
    const checkEditorInstance = () => {
      if (window.editorInstance) {
        setEditorReady(true);
        return true;
      }
      return false;
    };

    // 如果編輯器已經初始化，直接設置狀態
    if (checkEditorInstance()) return;

    // 否則每 200ms 檢查一次，最多檢查 15 次 (3 秒)
    let attempts = 0;
    const maxAttempts = 15;
    const intervalId = setInterval(() => {
      if (checkEditorInstance() || attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
      attempts++;
    }, 200);

    return () => clearInterval(intervalId);
  }, []);

  // 載入文章資料
  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const response = await axios.get(`https://lenstudio.onrender.com/api/articles/${articleId}`)
        const article = response.data.data
        setArticleData(article)

        // 如果有 hashtags，更新 state
        if (article.hashtags) {
          setHashtags(article.hashtags)
        }

        // 設置初始圖片路徑
        if (article.image_path) {
          setCurrentImagePath(article.image_path);
        }

        // 填充表單
        setTimeout(() => {
          const categorySelect = document.querySelector('select[name="文章分類"]')
          const titleInput = document.querySelector('input[placeholder="標題 (必填)"]')
          const subtitleInput = document.querySelector('input[placeholder="副標題"]')
          const imagePathInput = document.querySelector('#imagePath')
          const imagePreview = document.querySelector('#imagePreview') // 新增：獲取預覽元素

          if (categorySelect) categorySelect.value = article.category_id
          if (titleInput) titleInput.value = article.title
          if (subtitleInput) subtitleInput.value = article.subtitle

          // 新增：設置圖片路徑和預覽
          if (imagePathInput && article.image_path) {
            imagePathInput.value = article.image_path
            // 如果有預覽元素，設置預覽圖
            if (imagePreview) {
              imagePreview.src = article.image_path
              imagePreview.style.display = 'block'
            }
          }

          // 不在這裡設置編輯器內容，改由下方的 useEffect 處理
        }, 0)
      } catch (error) {
        console.error('載入文章錯誤:', error)
        errorAlert.fire({
          icon: 'error',
          title: '載入文章失敗',
          text: '無法取得文章資料，請稍後再試'
        })
      }
    }

    if (articleId) {
      fetchArticleData()
    }
  }, [articleId])

  // 新增: 當編輯器就緒且文章數據可用時，設置編輯器內容
  useEffect(() => {
    if (editorReady && articleData && articleData.content) {
      try {
        // 添加安全檢查
        if (window.editorInstance && typeof window.editorInstance.html === 'object') {
          window.editorInstance.html.set(articleData.content);
        } else {
          console.log('編輯器實例尚未準備好，等待下次嘗試');
        }
      } catch (error) {
        // console.error('設置編輯器內容時出錯:', error);
      }
    }
  }, [editorReady, articleData]);

  const confirmClose = useCallback(() => {
    router.push('/user/article')
  }, [router])

  const handleUpdateArticle = useCallback(async () => {
    // 先檢查必填欄位
    const allFilled = checkRequiredFields()
    if (!allFilled) {
      setHasError(true)
      errorAlert.fire({
        icon: 'error',
        title: '錯誤',
        text: '請填寫所有必填欄位',
      })
      return
    }

    try {
      // 獲取必要表單元素
      const categorySelect = document.querySelector('select[name="文章分類"]')
      const titleInput = document.querySelector('input[placeholder="標題 (必填)"]')
      const subtitleInput = document.querySelector('input[placeholder="副標題"]')

      // 降低檢查嚴格度
      if (!categorySelect || !titleInput) {
        console.error('找不到必要的表單元素:',
          !categorySelect ? '分類選擇器缺失' : '',
          !titleInput ? '標題輸入框缺失' : ''
        );
        errorAlert.fire({
          icon: 'error',
          title: '表單錯誤',
          text: '無法找到必要表單欄位，請重新整理頁面後再試',
        })
        return
      }

      // 使用編輯器中的內容
      const content = window.editorInstance?.html?.get() || ''

      // 獲取標籤
      const hashtagEls = document.querySelectorAll('#hashtag-preview .badge') || []
      const updatedHashtags = Array.from(hashtagEls).map((el) =>
        el.textContent.replace(/×$/, '')
      )

      // 重要：使用 React 狀態中的圖片路徑，而不是嘗試從 DOM 獲取
      console.log('使用圖片路徑:', currentImagePath);

      // 發送請求
      await axios.put(`https://lenstudio.onrender.com/api/articles/${articleId}`, {
        category: categorySelect.value,
        title: titleInput.value.trim(),
        subtitle: subtitleInput ? subtitleInput.value.trim() : '',
        content,
        image_path: currentImagePath, // 使用狀態變數
        hashtags: updatedHashtags,
        removedHashtags: [],
      })

      // 顯示成功訊息
      autoCloseAlert.fire({
        icon: 'success',
        title: '更新成功',
        text: '文章已成功更新'
      }).then(() => {
        confirmClose()
      })
    } catch (error) {
      console.error('更新文章時發生錯誤:', error)
      errorAlert.fire({
        icon: 'error',
        title: 'Oops...',
        text: '更新失敗，請稍後再試'
      })
    }
  }, [articleId, confirmClose, articleData, currentImagePath]) // 確保添加 currentImagePath 作為依賴

  return (
    <>
      <div className={`d-flex container py-4 ${styles.marginTop}`}>
        <Sidenav />
        <div className="container">
          <h1 className="mb-4">編輯文章</h1>
          <div className={`container ${styles['add-article-area']}`}>
            <BackSelectTitle confirmClose={confirmClose} />
            <div className="my-4">
              <ImageUpdate
                ref={imageUpdateRef}
                hasError={hasError}
                initialImagePath={articleData?.image_path}
                onImagePathChange={setCurrentImagePath} // 添加回調
              />
            </div>
            <div className="my-4">
              <FroalaEditor
                initialContent={articleData?.content}
                key={articleId || 'default-key'}
              />
            </div>
            <div className="my-4">
              <EditHashtagInput
                initialTags={hashtags}
                onTagsChange={(newTags) => setHashtags(newTags)}
              />
            </div>
            <EditButtonGroup
              confirmClose={confirmClose}
              onUpdateArticle={handleUpdateArticle}
            />
          </div>
        </div>
      </div>
    </>
  )
}