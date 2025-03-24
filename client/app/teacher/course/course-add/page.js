'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/ck-custom.css'
import styles from './course-add.module.scss'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { FiPlusCircle } from 'react-icons/fi'

const editorConfig = {
  extraPlugins: [
    function (editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return {
          upload: async () => {
            const file = await loader.file
            const formData = new FormData()
            formData.append('upload', file)

            const response = await fetch(
              'https://lenstudio.onrender.com/api/course-ct-upload',
              {
                method: 'POST',
                body: formData,
              }
            )

            const data = await response.json()
            // console.log('✅ 圖片上傳成功，URL:', data.url)
            return { default: `https://lenstudio.onrender.com${data.url}` }
          },
        }
      }
    },
  ],

  image: {
    toolbar: [
      'imageTextAlternative',
      '|',
      'imageStyle:full',
      'imageStyle:side',
    ],
    upload: {
      types: ['jpeg', 'png', 'gif', 'avif', 'webp'],
    },
  },

  imageUpload: {
    allowedTypes: ['jpeg', 'png', 'gif', 'avif', 'webp'],
  },

  toolbar: [
    'undo',
    'redo',
    'heading',
    '|',
    'bold',
    'italic',
    '|',
    'imageUpload',
    '|',
  ],

  heading: {
    options: [
      { model: 'paragraph', title: '內文', class: 'ck-heading_paragraph' },
      {
        model: 'heading3',
        view: 'h3',
        title: '標題',
        class: 'ck-heading_heading3',
      },
    ],
  },
}


export default function CourseCreate() {
  const fileInputRef = useRef(null)
  const router = useRouter()
  const [previewImg, setPreviewImg] = useState(null) // ✅ 預設無圖片
  const [loading, setLoading] = useState(false) // ✅ 控制 `loading` 狀態

  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    original_price: '',
    sale_price: '',
    image_url: '',
    content: '',
    status: 'draft',
  })

  // **處理輸入變更**
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCourse((prev) => ({ ...prev, [name]: value }))
  }

  // **處理 CKEditor 內容變更**
  const handleEditorChange = (event, editor) => {
    const data = editor.getData()
    setCourse((prev) => ({ ...prev, content: data }))
  }

  // **觸發圖片選擇**
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // **處理圖片上傳**
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      // console.log('❌ 沒有選擇任何檔案')
      return
    }

    const formData = new FormData()
    formData.append('upload', file)

    try {
      const response = await fetch(
        'https://lenstudio.onrender.com/api/course-cv-upload',
        {
          method: 'POST',
          body: formData,
        }
      )

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('❌ API 沒回傳 JSON，可能是 404/500 錯誤')
      }

      const data = await response.json()
      const fullUrl = `https://lenstudio.onrender.com${data.url}` // ✅ 修正 URL

      // console.log('✅ 圖片上傳成功，URL:', fullUrl)

      // **即時更新圖片預覽**
      setCourse((prev) => ({ ...prev, image_url: fullUrl }))
      setPreviewImg(fullUrl)
    } catch (error) {
      console.error('❌ 圖片上傳失敗:', error)
    }
  }

  // **提交表單**
  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = 'https://lenstudio.onrender.com/api/courses';
    // console.log('🚀 發送 `POST` 請求到:', apiUrl);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('loginWithToken')}`,
        },
        body: JSON.stringify({ ...course, status }),
      });

      // console.log('🔍 API 回應狀態:', res.status);
      const data = await res.json();
      // console.log('🔍 API 回應資料:', data);

      if (!res.ok) {
        console.error('❌ API 錯誤:', data);
        throw new Error(`❌ API 錯誤: ${res.status}`);
      }

      if (!data.courseId) {
        throw new Error('❌ API 沒有回傳 `courseId`，可能 SQL 沒寫入');
      }

      // console.log('✅ 課程新增成功！');
      router.push('/teacher');
    } catch (error) {
      console.error('❌ 新增課程失敗:', error);
    } finally {
      setLoading(false);
    }
  };


  // ✅ `loading` 時顯示「課程新增中...」
  if (loading) return <p className="text-center">⏳ 課程新增中...</p>

  return (
    <div className={styles['center-content']}>
      <div className={styles['nav-bar']}>
        <h1>新增課程</h1>
      </div>

      {/* 📌 編輯表單 */}
      <form
        className={styles['course-edit']}
        onSubmit={(e) => handleSubmit(e, 'draft')}
      >
        <div className="row">
          {/* 🔹 課程縮圖上傳 */}
          <div className="col-md-4">
            <div className={styles['form-group']}>
              <label>
                課程封面 <span className={styles['required']}>*</span>
              </label>
              <div
                className={styles['image-upload']}
                onClick={handleUploadClick}
              >
                {previewImg ? (
                  <img src={previewImg} alt="課程圖片" />
                ) : (
                  <div className={styles['upload-placeholder']}>
                    <FiPlusCircle className={styles['upload-icon']} />
                    <p>點擊上傳圖片</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            {/* 🔹 課程名稱 */}
            <div className={styles['form-group']}>
              <label>
                課程名稱 <span className={styles['required']}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* 🔹 課程簡介 */}
            <div className={styles['form-group']}>
              <label>
                課程簡介 <span className={styles['required']}>*</span>
              </label>
              <textarea
                className={styles['course-info']}
                name="description"
                rows="4"
                value={course.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* 🔹 課程分類 */}
            <div className={styles['form-group']}>
              <label>
                請選擇分類 <span className={styles['required']}>*</span>
              </label>
              <select
                className={styles['category-select']}
                name="category"
                value={course.category}
                onChange={handleInputChange}
                required
              >
                <option value="影像創作">影像創作</option>
                <option value="商業攝影">商業攝影</option>
                <option value="後製剪輯">後製剪輯</option>
                <option value="攝影理論">攝影理論</option>
              </select>
            </div>

            {/* 🔹 價格設定 */}
            <div className={styles['price-container']}>
              <div className={styles['form-group']}>
                <label>
                  課程定價 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="number"
                  name="original_price"
                  value={course.original_price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles['form-group']}>
                <label>
                  課程售價 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={course.sale_price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* 🔹 課程內容 */}
          <div className="col-md-8">
            <div className={styles['form-group']}>
              <label>
                課程內容 <span className={styles['required']}>*</span>
              </label>
              <div className={styles['editor-container']}>
                <CKEditor
                  editor={ClassicEditor}
                  data={course.content}
                  onChange={handleEditorChange}
                  config={editorConfig}
                />
              </div>
            </div>

            {/* 🔹 按鈕區 */}
            <div className={styles['form-actions']}>
              <button
                type="submit"
                className={styles['save-btn']}
                onClick={(e) => handleSubmit(e, 'draft')}
              >
                儲存為草稿
              </button>
              <button
                type="submit"
                className={styles['publish-btn']}
                onClick={(e) => handleSubmit(e, 'published')}
              >
                上架課程
              </button>
              <button
                type="button"
                className={styles['cancel-btn']}
                onClick={() => router.push('/teacher')}
              >
                返回課程列表
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
