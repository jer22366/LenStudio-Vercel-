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

export default function FroalaEditorWrapper({ initialContent }) {
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
          // 添加以下配置確保樣式優先保留
          htmlAllowedStyles: ['.*'], // 允許所有 CSS 樣式
          htmlAllowedAttrs: ['.*'], // 允許所有 HTML 屬性
          htmlUntouched: true, // 保留原始 HTML 格式
          styleManagerAllowClasses: true, // 允許所有 CSS 類
          // 確保對齊樣式被保留
          htmlDoNotWrapTags: ['br', 'img', 'hr'],
          events: {
            initialized: function () {
              console.log('Froala Editor 初始化完成，設定全局實例');
              window.editorInstance = this;
              this.el.style.backgroundColor = 'transparent';

              // 新增: 注入高優先級樣式
              const cssOverride = document.createElement('style');
              cssOverride.textContent = '.fr-view [style*="text-align"] { text-align: inherit !important; }';
              document.head.appendChild(cssOverride);

              // 確保初始內容會被設定
              if (initialContent) {
                console.log('設定初始內容：', initialContent.substring(0, 50) + '...');
                // 使用小延遲確保編輯器已經完全初始化
                setTimeout(() => {
                  this.html.set(initialContent);
                }, 200);
              }
            },
            // 修改 contentChanged 事件，不再重新設置內容
            contentChanged: function () {
              // 只檢查但不重設內容，避免游標跳回問題
              const content = this.html.get();

              // 只在發現空 src 的圖片時才處理，且使用 DOM API 直接修改
              if (content.includes('img src=""')) {
                const images = this.el.querySelectorAll('img[src=""]');
                images.forEach(img => {
                  img.removeAttribute('src');
                });
              }
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
            'image.error': function (error, response) {
              console.error('圖片上傳錯誤:', error, response);
              // 顯示錯誤訊息給使用者
              alert('圖片上傳失敗: ' + (response?.error || error?.message || '未知錯誤'));
            },
            'video.error': function (error, response) {
              console.error('影片上傳錯誤:', error, response);
              alert('影片上傳失敗: ' + (response?.error || error?.message || '未知錯誤'));
            },
            'file.error': function (error, response) {
              console.error('檔案上傳錯誤:', error, response);
              alert('檔案上傳失敗: ' + (response?.error || error?.message || '未知錯誤'));
            },
            'image.uploaded': function (response) {
              console.log('圖片上傳成功，返回的資料:', response);
              // 可以在這裡添加自定義處理邏輯
            },
          },
          zIndex: 1050,
          toolbarSticky: true,
          toolbarStickyOffset: 80  // 根據 header 高度調整
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
  }, [initialContent])

  return (
    <>
      <p>
        文章內容 <span className={`mx-1 ${styles['red-sign']}`}>*</span> :
      </p>
      <div id="example" ref={editorRef}></div>
    </>
  )
}
