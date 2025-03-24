'use client'

import React, { useEffect, useRef } from 'react'
import FroalaEditor from 'froala-editor'
import 'froala-editor/js/languages/zh_tw.js'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import 'froala-editor/js/plugins.pkgd.min.js'
import $ from 'jquery'
import styles from './AddArticleModal.module.scss'

// 設置 jQuery 為全域變數
if (typeof window !== 'undefined') {
  window.$ = $
  window.jQuery = $
}

export default function FroalaEditorWrapper() {
  const editorRef = useRef(null)

  useEffect(() => {
    let editorInstance = null

    const loadFroalaEditor = () => {
      if (editorRef.current) {
        editorInstance = new FroalaEditor(editorRef.current, {
          language: 'zh_tw',
          toolbarButtons: {
            moreText: {
              buttons: [
                'bold',
                'italic',
                'underline',
                'strikeThrough',
                'subscript',
                'superscript',
                'fontFamily',
                'fontSize',
                'textColor',
                'backgroundColor',
                'inlineClass',
                'inlineStyle',
                'clearFormatting',
              ],
            },
            moreParagraph: {
              buttons: [
                'alignLeft',
                'alignCenter',
                'alignRight',
                'alignJustify',
                'formatOL',
                'formatUL',
                'paragraphFormat',
                'paragraphStyle',
                'lineHeight',
                'outdent',
                'indent',
                'quote',
              ],
            },
            moreRich: {
              buttons: [
                'insertLink',
                'insertImage',
                'insertVideo',
                'insertTable',
                'emoticons',
                'fontAwesome',
                'specialCharacters',
                'embedly',
                'insertFile',
                'insertHR',
              ],
            },
            moreMisc: {
              buttons: ['undo', 'redo', 'fullscreen', 'html', 'help'],
            },
          },
          pluginsEnabled: null,
          imageUploadURL: '/api/froala-upload?type=image',
          videoUploadURL: '/api/froala-upload?type=video',
          fileUploadURL: '/api/froala-upload?type=file',
          events: {
            contentChanged: function () {
              // 取得編輯器內容
              const content = this.html.get()
              // 建立一個 DOM 解析器
              const parser = new DOMParser()
              // 將編輯器內容解析為 DOM
              const doc = parser.parseFromString(content, 'text/html')
              // 取得所有 <img> 標籤
              const images = doc.querySelectorAll('img')
              // 迴圈處理每個 <img> 標籤
              images.forEach((image) => {
                // 取得 src 屬性
                const src = image.getAttribute('src')
                // 如果 src 屬性為空字串
                if (src === '') {
                  // 將 src 屬性設定為 null
                  image.setAttribute('src', null)
                }
              })
              // 將修改後的 DOM 轉換為 HTML
              const newContent = doc.body.innerHTML
              // 設定編輯器內容
              this.html.set(newContent)
            },
            initialized: function () {
              window.editorInstance = this
              // 修改內文區塊的樣式
              this.el.style.backgroundColor = 'transparent'
            },
            'image.beforeUpload': function (files) {
              console.log('圖片上傳前', files)
              return true
            },
            'image.uploaded': function (response) {
              console.log('圖片上傳成功，返回的資料：', response)
              // Froala 自動將 response.link 作為圖片 src 插入編輯器中
            },
            'video.beforeUpload': function (files) {
              console.log('影片上傳前', files)
              return true
            },
            'file.beforeUpload': function (files) {
              console.log('文件上傳前', files)
              return true
            },
          },
          zIndex: 1050,
        })
      }
    }

    loadFroalaEditor()

    return () => {
      if (editorInstance) {
        editorInstance.destroy()
      }
      window.editorInstance = null
    }
  }, [])

  return (
    <>
      <p>
        文章內容 <span className={`mx-1 ${styles['red-sign']}`}>*</span> :
      </p>
      <div id="example" ref={editorRef}></div>
    </>
  )
}
