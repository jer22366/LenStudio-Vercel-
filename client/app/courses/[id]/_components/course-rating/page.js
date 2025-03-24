'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import styles from './course-rating.module.scss'
import CourseComment from '../course-comment/page'
import StarRating from '@/app/courses/_components/star-rating/page'
import { useParams } from 'next/navigation'
import Link from "next/link";

export default function CourseRating() {
  const { id } = useParams()
  const [comments, setComments] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAllComments, setShowAllComments] = useState(false)
  const modalContentRef = useRef(null)
  const [scrollToCommentId, setScrollToCommentId] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (!id) return

    const fetchComments = async () => {
      try {
        const res = await fetch(`https://lenstudio.onrender.com/api/courses/${id}/comments`)
        if (!res.ok) throw new Error('無法獲取評論資料')

        const data = await res.json()

        setComments(data)

        //  確保所有 `rating` 值都是數字
        const validRatings = data
          .map((comment) => parseFloat(comment.rating))
          .filter((rating) => !isNaN(rating))

        //  計算平均評分
        const avg = validRatings.length
          ? validRatings.reduce((sum, rating) => sum + rating, 0) /
          validRatings.length
          : 0
        setAverageRating(avg.toFixed(1)) // ✅ 確保這行執行
      } catch (err) {
        console.error('❌ 載入評論失敗:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [id])

  // 在 CourseRating 組件中

  useEffect(() => {
    if (showAllComments && scrollToCommentId !== null) {

      const tryScroll = (attempts = 0) => {
        setTimeout(() => {
          const modalContent = modalContentRef.current
          const targetComment = document.getElementById(
            `comment-${scrollToCommentId}`
          )

          if (modalContent && targetComment) {
            const rect = targetComment.getBoundingClientRect()
            const scrollToPosition =
              targetComment.offsetTop - modalContent.clientHeight / 2 + targetComment.clientHeight / 2

            modalContent.scrollTo({
              top: scrollToPosition,
              behavior: 'smooth',
            })

            // console.log(
            //   `✅ 滾動後 modalContent.scrollTop:`,
            //   modalContent.scrollTop
            // )
          } else if (attempts < 5) {
            console.warn(`⚠️ 找不到評論，嘗試重新滾動 #${attempts + 1}`)
            tryScroll(attempts + 1)
          } else {
            console.error(`❌ 最多嘗試 5 次，仍然找不到評論`)
          }
        }, 100 * (attempts + 1))
      }

      tryScroll()
    }
  }, [showAllComments, scrollToCommentId])

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) =>
      comments.filter((comment) => Math.round(comment.rating) === star).length
  )

  const totalReviews = comments.length || 1
  const ratingPercentages = ratingCounts.map(
    (count) => (count / totalReviews) * 100
  )

  const handleOverlayClick = (e) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target)
    ) {
      setShowAllComments(false)
      setScrollToCommentId(null)
    }
  }

  useEffect(() => {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition !== null) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(scrollPosition, 10), behavior: "smooth" });
        sessionStorage.removeItem("scrollPosition"); // ✅ 只滾動一次，之後清除
      }, 500);
    }
  }, []);


  return (
    <section className={styles['course-rating-container']} id="course-rating">
      <div className={styles['section-detail-title']} data-aos="fade-right">
        <div className={styles['title-block']}></div>
        <h2>課程評價</h2>
      </div>
      <div className={styles['course-rating']} data-aos="fade-up">
        <div className={styles['rating-left']}>
          <div className={styles['score-area']}>
            <p className={styles['score']}>{averageRating}</p>
            <p className={styles['total-score']}>/ 5.0</p>
          </div>
          <div className={styles['star-area']}>
            <div className={styles['rating']}>
              <StarRating rating={averageRating} />
            </div>
            <div className={styles['rating-count']}>
              {comments.length} 則評價
            </div>
          </div>
        </div>
        <div className={styles['rating-right']}>
          {[5, 4, 3, 2, 1].map((rating, index) => (
            <div key={rating} className={styles['progress-container']}>
              <div className={styles['count']}>{rating}</div>
              <div
                className="progress "
                style={{
                  width: '400px',
                  height: '8px',
                  minWidth: '50px',
                  backgroundColor: '#E0E0E0',
                }}
              >
                <div
                  className={styles['progress-bar']}
                  role="progressbar"
                  style={{
                    width: `${ratingPercentages[index]}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 評論區 - 只顯示前 4 則評論 */}
      <div className="row g-3">
        {comments.slice(0, 4).map((comment, index) => (
          <CourseComment
            key={comment.id}
            courseId={id}
            isModal={false}
            commentId={comment.id}
            name={comment.user_name}
            date={comment.created_at}
            rating={comment.rating}
            title={comment.title || '無標題'}
            content={comment.content}
            imgSrc={comment.user_head || '/images/default-avatar.jpg'}
            onShowAllComments={(id) => {
              // console.log('🔍 設定 scrollToCommentId:', id)
              setScrollToCommentId(id)
              setShowAllComments(true)
            }}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* 所有評價按鈕（打開彈出視窗） */}
      {comments.length > 4 && (
        <div className={styles['all-comment-link']}>
          <button
            onClick={() => {
              sessionStorage.setItem("scrollPosition", window.scrollY);
              if (isMobile) {
                window.location.href = `/courses/${id}/comment`; // 手機版跳轉新頁面
              } else {
                setShowAllComments(true)
              }
            }}
            className={styles['open-modal-btn']}
          >
            所有評論 <img src="/images/icon/all-comment.svg" alt="所有評價" />
          </button>
        </div>
      )}

      {/* 彈出視窗 - 顯示所有評論 */}
      {showAllComments && (
        <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
          <div className={styles['modal']}>
            <button
              className={styles['close-btn']}
              onClick={() => {
                setShowAllComments(false)
                setScrollToCommentId(null)
              }}
            >
              ✖
            </button>

            <h2>所有評論</h2>
            <div className={styles['modal-content']} ref={modalContentRef}>
              {comments.map((comment, index) => (
                <CourseComment
                  key={comment.id}
                  commentId={comment.id}
                  name={comment.user_name}
                  date={comment.created_at}
                  rating={comment.rating}
                  title={comment.title || '無標題'}
                  content={comment.content}
                  imgSrc={comment.user_head || '/images/default-avatar.jpg'}
                  isModal={true}
                  id={`comment-${comment.id}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
