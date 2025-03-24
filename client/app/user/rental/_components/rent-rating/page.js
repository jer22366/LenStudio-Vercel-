// rent-rating

'use client'

import React, { useState, useEffect } from 'react'
import { IoStar, IoStarOutline } from 'react-icons/io5'
import styles from './star.module.css'

export default function StarRating({ rating, setRating }) {
  const [hoverRating, setHoverRating] = useState(0)
  const [currentRating, setCurrentRating] = useState(rating)

  // ⚠️ 確保外部評分變化時，內部狀態同步更新
  useEffect(() => {
    setCurrentRating(rating)
  }, [rating])


  return (
    <div className={styles.starContainer}>
      {Array(5)
        .fill(1)
        .map((_, index) => {
          const score = index + 1
          return (
            <button
              key={score}
              className={styles.starBtn}
              type="button"
              onClick={() => {
                setRating(score)
                setCurrentRating(score)
              }}
              onMouseEnter={() => setHoverRating(score)}
              onMouseLeave={() => setHoverRating(0)}
            >
              {score <= (hoverRating || currentRating) ? (
                <IoStar className={styles.starIcon} />
              ) : (
                <IoStarOutline className={styles.starIcon} />
              )}
            </button>
          )
        })}
    </div>
  )
}
