'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'bootstrap/dist/css/bootstrap.min.css'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import styles from './AddArticleModal.module.scss'
import BackSelectTitle from './back-select-title'
import ImageUpdate from './imageUpdate'
import HashtagInput from './hashtag-input'
import ButtonGroup from './ButtonGroup'
import Sidenav from '../../_components/Sidenav/page'
import useAuth from '@/hooks/use-auth'
import { errorAlert, successAlert, autoCloseAlert } from '@/utils/sweetAlertConfig'
const FroalaEditor = dynamic(() => import('./froalaEditor'), { ssr: false })

export const checkRequiredFields = () => {
  let allFilled = true
  const errorBorder = '1px solid rgb(200, 57, 31)'
  const defaultBorder = ''

  const categorySelect = document.querySelector('select[name="文章分類"]')
  const titleInput = document.querySelector('input[placeholder="標題 (必填)"]')
  const imageSourceLocal = document.querySelector('#imageSourceLocal')
  const imageUpload = document.querySelector('#imageUpload')
  const imagePath = document.querySelector('#imagePath')
  const editorDiv = document.querySelector('#example')
  const editorInstance = window.editorInstance

  // 文章分類
  if (categorySelect && categorySelect.value === '0') {
    categorySelect.style.border = errorBorder
    allFilled = false
  } else if (categorySelect) {
    categorySelect.style.border = defaultBorder
  }

  // 標題
  if (titleInput && !titleInput.value.trim()) {
    titleInput.style.border = errorBorder
    allFilled = false
  } else if (titleInput) {
    titleInput.style.border = defaultBorder
  }

  // 圖片
  if (imageSourceLocal && imageSourceLocal.checked) {
    if (!imageUpload || !imageUpload.files || imageUpload.files.length === 0) {
      if (imageUpload) imageUpload.style.border = errorBorder
      allFilled = false
    } else {
      if (imageUpload) imageUpload.style.border = defaultBorder
    }
  } else {
    if (!imagePath || !imagePath.value.trim()) {
      if (imagePath) imagePath.style.border = errorBorder
      allFilled = false
    } else {
      if (imagePath) imagePath.style.border = defaultBorder
    }
  }

  // Froala 編輯器
  const content = editorInstance?.html.get() || ''
  if (!content || !content.trim() || content.trim() === '<p><br></p>') {
    if (editorDiv) editorDiv.style.border = errorBorder
    allFilled = false
  } else {
    if (editorDiv) editorDiv.style.border = defaultBorder
  }

  return allFilled
}

export default function AddArticlePage() {
  const { user, token } = useAuth()
  const [hasError, setHasError] = useState(false)
  const imageUpdateRef = useRef(null)
  const router = useRouter()

  // 當使用者完成新增後，或按返回關閉時，導向回文章列表頁（例如：/user/article）
  const confirmClose = useCallback(() => {
    router.push('/user/article')
  }, [router])

  const handleAddArticle = useCallback(async () => {
    const allFilled = checkRequiredFields()
    if (!allFilled) {
      setHasError(true)
      errorAlert.fire({
        icon: 'error',
        title: '錯誤',
        text: '請填寫所有必填欄位'
      })
      return
    }

    try {
      const categorySelect = document.querySelector('select[name="文章分類"]')
      const titleInput = document.querySelector('input[placeholder="標題 (必填)"]')
      const subtitleInput = document.querySelector('input[placeholder="副標題"]')
      const imagePathInput = document.querySelector('#imagePath')
      const editorInstance = window.editorInstance
      const content = editorInstance ? editorInstance.html.get() : ''

      const hashtagEls = document.querySelectorAll('#hashtag-preview .badge')
      const hashtags = Array.from(hashtagEls).map((el) =>
        el.textContent.replace(/×$/, '')
      )

      const category = categorySelect ? categorySelect.value : null
      const title = titleInput ? titleInput.value.trim() : ''
      const subtitle = subtitleInput ? subtitleInput.value.trim() : ''
      const image_path = imagePathInput ? imagePathInput.value.trim() : ''

      // 確保 image_path 格式正確
      if (image_path && !image_path.startsWith('https://')) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '圖片路徑必須以 https:// 開頭',
        })
        return
      }

      // 透過 useAuth 取得 token
      // 假設你從 useAuth hook 已取得 token
      await axios.post(
        'https://lenstudio.onrender.com/api/articles',
        {
          category,
          title,
          subtitle,
          content,
          image_path,
          hashtags,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // 文章成功發布後，顯示無按鈕、自動關閉的成功彈窗
      autoCloseAlert.fire({
        icon: 'success',
        title: '新增成功',
        text: '文章已成功發布'
      }).then(() => {
        confirmClose()
      })
    } catch (error) {
      console.error('新增文章時發生錯誤:', error)
      errorAlert.fire({
        icon: 'error',
        title: 'Oops...',
        text: '發布失敗，請稍後再試'
      })
    }
  }, [confirmClose, token]) // 注意：確保 token 是 useAuth 回傳的一部份

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '您確定要離開此頁面嗎？您所做的變更可能不會被儲存。';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    history.replaceState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [confirmClose]);

  return (
    <>
      <div className={`d-flex container py-4 ${styles.marginTop}`}>
        {/* 側邊選單 */}
        <Sidenav />
        <div className="container">
          <h1 className="mb-4">新增文章</h1>
          <div className={`container ${styles['add-article-area']}`}>
            {/* <h1 className="mb-4">新增文章</h1> */}
            {/* 返回按鈕 */}
            <BackSelectTitle confirmClose={confirmClose} />
            <div className="my-4">
              <ImageUpdate ref={imageUpdateRef} hasError={hasError} />
            </div>
            <div className="my-4">
              <FroalaEditor />
            </div>
            <div className="my-4">
              <HashtagInput />
            </div>
            <ButtonGroup confirmClose={confirmClose} onAddArticle={handleAddArticle} />
          </div>
        </div>
      </div>
    </>
  )
}