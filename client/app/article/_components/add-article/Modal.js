'use client'
import React, { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'bootstrap/dist/css/bootstrap.min.css'
import Swal from 'sweetalert2'
import axios from 'axios'
import styles from './AddArticleModal.module.scss'
import BackSelectTitle from './back-select-title'
import ImageUpdate from './imageUpdate'
import HashtagInput from './hashtag-input'
import ButtonGroup from './ButtonGroup'

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
    // 本地圖片：若未選取檔案，拖曳區的邊框改為 errorBorder
    if (!imageUpload || !imageUpload.files || imageUpload.files.length === 0) {
      if (imageUpload) imageUpload.style.border = errorBorder
      allFilled = false
    } else {
      if (imageUpload) imageUpload.style.border = defaultBorder
    }
  } else {
    // 圖片路徑：若未輸入內容，輸入框邊框改為 errorBorder
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

export default function AddArticleModal({ onClose }) {
  const modalRef = useRef(null)
  const bsModal = useRef(null)
  const imageUpdateRef = useRef(null) // 新增 ImageUpdate ref
  const [hasError, setHasError] = useState(false)

  // 關閉 Modal 時，可同時重置錯誤狀態
  const confirmClose = useCallback(() => {
    if (bsModal.current) {
      bsModal.current.hide()
    }
    setHasError(false)
    if (onClose) onClose()
  }, [onClose])

  // ============== 新增文章核心程式 ==============
  const handleAddArticle = useCallback(async () => {
    // 在 handleAddArticle 開頭呼叫 checkRequiredFields
    const allFilled = checkRequiredFields()

    if (!allFilled) {
      setHasError(true) // 設定錯誤狀態，讓 ImageUpdate 等元件呈現錯誤樣式
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '請填寫所有必填欄位',
      })
      return
    } else {
      setHasError(false)
    }

    try {
      // 取得表單資料…
      const categorySelect = document.querySelector('select[name="文章分類"]')
      const titleInput = document.querySelector(
        'input[placeholder="標題 (必填)"]'
      )
      const subtitleInput = document.querySelector(
        'input[placeholder="副標題"]'
      )
      const imagePathInput = document.querySelector('#imagePath')
      const editorInstance = window.editorInstance // Froala 實例
      const content = editorInstance ? editorInstance.html.get() : ''

      // 從 Hashtag 預覽區域收集 hashtag …
      const hashtagEls = document.querySelectorAll('#hashtag-preview .badge')
      const hashtags = Array.from(hashtagEls).map((el) =>
        el.textContent.replace(/×$/, '')
      )

      const categoryId = categorySelect ? categorySelect.value : '0'
      const title = titleInput ? titleInput.value.trim() : ''
      const subtitle = subtitleInput ? subtitleInput.value.trim() : ''
      const imagePath = imagePathInput ? imagePathInput.value.trim() : ''

      // 驗證圖片路徑格式
      if (imagePath && !imagePath.startsWith('https://')) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '圖片路徑必須以 https:// 開頭',
        })
        return
      }

      // 向後端送出資料
      await axios.post('https://lenstudio.onrender.com/api/articles', {
        category: categoryId,
        title,
        subtitle,
        content,
        image_path: imagePath,
        hashtags,
      })

      // 新增成功後關閉 Modal
      confirmClose()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '出現問題囉，請稍後再試',
      })
      console.error('Error adding article:', error)
    }
  }, [confirmClose])

  useEffect(() => {
    if (typeof window === 'undefined') return
    import('bootstrap/js/dist/modal').then(({ default: Modal }) => {
      bsModal.current =
        Modal.getInstance(modalRef.current) ||
        new Modal(modalRef.current, {
          backdrop: 'static',
          keyboard: false,
        })

      const modalEl = modalRef.current

      const handleModalHidden = () => {
        // 清除表單欄位內容及錯誤樣式
        const categorySelect = document.querySelector('select[name="文章分類"]')
        const titleInput = document.querySelector(
          'input[placeholder="標題 (必填)"]'
        )
        const subtitleInput = document.querySelector(
          'input[placeholder="副標題"]'
        )
        const imageUpload = document.querySelector('#imageUpload')
        const imagePath = document.querySelector('#imagePath')
        const editorDiv = document.querySelector('#example')

        if (categorySelect) categorySelect.value = '0'
        if (titleInput) titleInput.value = ''
        if (subtitleInput) subtitleInput.value = ''
        if (imageUpload) imageUpload.value = ''
        if (imagePath) imagePath.value = ''

        if (window.editorInstance) {
          window.editorInstance.html.set('')
        }

        // 呼叫 ImageUpdate 的 clearImagePreview 來重置狀態（包含 radio）
        if (imageUpdateRef.current) {
          imageUpdateRef.current.clearImagePreview()
        }

        ;[
          categorySelect,
          titleInput,
          subtitleInput,
          imageUpload,
          imagePath,
          editorDiv,
        ].forEach((el) => {
          if (el) el.style.border = ''
        })

        // 清除錯誤狀態
        setHasError(false)
      }

      modalEl.addEventListener('hidden.bs.modal', handleModalHidden)

      // backdrop 點擊事件處理記得保持不變…
      modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) {
          Swal.fire({
            title: '尚未儲存完畢，是否確認離開？',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '確認',
            cancelButtonText: '取消',
            customClass: {
              confirmButton: `${styles['btn-sweetalert']} btn`,
              cancelButton: `${styles['btn-sweetalert-2']} btn`,
            },
          }).then((result) => {
            if (result.isConfirmed) {
              confirmClose()
            }
          })
        }
      })

      return () => {
        modalEl.removeEventListener('hidden.bs.modal', handleModalHidden)
        modalEl.removeEventListener('click', () => { })
      }
    })
  }, [confirmClose])

  return (
    <>
      <div
        className={styles.addArticleCard}
        onClick={() => {
          if (bsModal.current) {
            bsModal.current.show()
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="text-center">
          <div className={`${styles.addButton} mx-auto mb-3`}></div>
          <h5>新增文章</h5>
        </div>
      </div>

      <div
        ref={modalRef}
        className="modal fade"
        id="addArticleModal"
        tabIndex="-1"
        aria-labelledby="addArticleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className={`modal-content ${styles['modal-content']}`}>
            <div className="modal-body">
              <div className="container">
                <BackSelectTitle confirmClose={confirmClose} />
                <ImageUpdate ref={imageUpdateRef} hasError={hasError} />
                <FroalaEditor />
                <HashtagInput />
                <ButtonGroup
                  confirmClose={confirmClose}
                  onAddArticle={handleAddArticle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
