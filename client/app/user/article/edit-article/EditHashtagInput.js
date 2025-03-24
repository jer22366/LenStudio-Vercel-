'use client'

import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import 'animate.css'
import styles from '../add-article/AddArticleModal.module.scss'

const EditHashtagInput = ({ initialTags = [], onTagsChange }) => {
  const [hashtagInput, setHashtagInput] = useState('')
  const [hashtags, setHashtags] = useState(initialTags)

  useEffect(() => {
    if (initialTags.length > 0) {
      setHashtags(initialTags)
    }
  }, [initialTags])

  const handleInputChange = (e) => {
    setHashtagInput(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const inputVal = hashtagInput.trim()
      
      if (!inputVal.startsWith('#')) {
        Swal.fire({
          title: "Hashtag 必須以 '#' 開頭",
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster',
          },
        })
        return
      }

      let newTag = inputVal
      if (hashtags.length >= 5) {
        Swal.fire({
          title: '最多只能新增 5 個 hashtag',
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster',
          },
        })
        return
      }

      if (hashtags.includes(newTag)) {
        Swal.fire({
          title: 'Hashtag 不可以重複',
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster',
          },
        })
        return
      }

      const newHashtags = [...hashtags, newTag]
      setHashtags(newHashtags)
      onTagsChange(newHashtags)
      setHashtagInput('')
    }
  }

  const removeHashtag = (tagToRemove) => {
    const newHashtags = hashtags.filter(tag => tag !== tagToRemove)
    setHashtags(newHashtags)
    onTagsChange(newHashtags)
  }

  return (
    <div className="my-4">
      <label htmlFor="hashtag-input" className="form-label">
        Hashtag
      </label>
      <input
        type="text"
        className={`form-control ${styles['form-control']}`}
        id="hashtag-input"
        placeholder="請輸入 hashtag，必須以 # 起頭，按 Enter 新增"
        value={hashtagInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <div id="hashtag-preview" className="flex-wrap gap-2 mt-2 d-flex">
        {hashtags.map((tag, index) => (
          <div
            key={index}
            className={`badge d-flex align-items-center rounded-pill ${styles['y-hashtag']}`}
          >
            {tag}
            <button
              type="button"
              className={`btn-close ${styles['y-close-btn']} ms-2`}
              onClick={() => removeHashtag(tag)}
              aria-label="Close"
            ></button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EditHashtagInput