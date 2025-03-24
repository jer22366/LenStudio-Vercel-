import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react'
import Swal from 'sweetalert2'
import 'animate.css'
import styles from './AddArticleModal.module.scss'
// 導入統一彈窗配置
import { errorAlert } from '@/utils/sweetAlertConfig'

const HashtagInput = forwardRef((props, ref) => {
  const [hashtagInput, setHashtagInput] = useState('')
  const [hashtags, setHashtags] = useState([])

  // 使用 useImperativeHandle 暴露 clearHashtag 函式
  useImperativeHandle(ref, () => ({
    clearHashtag: () => {
      setHashtagInput('')
      setHashtags([])
    },
  }))

  const handleInputChange = (e) => {
    setHashtagInput(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const inputVal = hashtagInput.trim()
      if (!inputVal.startsWith('#')) {
        // 替換為統一樣式
        errorAlert.fire({
          icon: 'error',
          title: "Hashtag 必須以 '#' 開頭"
        })
        return
      }
      let inputTags = inputVal.split('#').filter((val) => val !== '')
      inputTags = inputTags.map((tag) => '#' + tag)

      let newHashtags = [...hashtags]
      for (const tag of inputTags) {
        if (newHashtags.length >= 5) {
          // 替換為統一樣式
          errorAlert.fire({
            icon: 'error',
            title: '最多只能新增 5 個 hashtag'
          })
          break
        }
        if (newHashtags.includes(tag)) {
          // 替換為統一樣式
          errorAlert.fire({
            icon: 'error',
            title: 'Hashtag 不可以重複'
          })
          continue
        }
        newHashtags.push(tag)
      }
      setHashtags(newHashtags)
      setHashtagInput('')
    }
  }

  const removeHashtag = (index) => {
    setHashtags(hashtags.filter((_, i) => i !== index))
  }

  return (
    <div className="my-4">
      <label htmlFor="hashtag-input" className="form-label">
        Hashtag
      </label>
      <input
        type="text"
        className={`form-control ${styles['form-control']} ${styles['hashtag-responsive-input']}`}
        id="hashtag-input"
        placeholder="請輸入 hashtag，必須以 # 起頭，按 Enter 新增"
        value={hashtagInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <div id="hashtag-preview" className="d-flex flex-wrap mt-2">
        {hashtags.map((tag, index) => (
          <span
            key={index}
            className={`badge bg-secondary me-2 mb-2 ${styles['hashtag-badge']}`}
          >
            {tag}
            <span
              className={styles['hashtag-remove-icon']}
              onClick={() => removeHashtag(index)}
            >
              ×
            </span>
          </span>
        ))}
      </div>
    </div>
  )
})

HashtagInput.displayName = 'HashtagInput'
export default HashtagInput
