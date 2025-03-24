'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import styles from './article.module.scss'
import '../../../styles/article.css'
import useAuth from '@/hooks/use-auth'
import Sidenav from '../_components/Sidenav/page'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UserArticleFilter from './_components/UserArticleFilter'
import ContentLoader from 'react-content-loader'
import AnimatedCounter from './_components/AnimatedCounter'

// 創建骨架屏元件
const ArticleCardSkeleton = () => (
  <ContentLoader
    speed={2}
    width={900}
    height={250}
    viewBox="0 0 900 250"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    {/* 左側內容 */}
    <rect x="20" y="20" rx="3" ry="3" width="150" height="15" />
    <rect x="20" y="50" rx="3" ry="3" width="300" height="30" />
    <rect x="20" y="100" rx="3" ry="3" width="380" height="15" />
    <rect x="20" y="130" rx="3" ry="3" width="250" height="15" />
    <rect x="20" y="200" rx="3" ry="3" width="200" height="15" />

    {/* 右側圖片 */}
    <rect x="500" y="20" rx="5" ry="5" width="370" height="210" />
  </ContentLoader>
)

// 用戶資訊卡片骨架屏
const UserInfoSkeleton = () => (
  <ContentLoader
    speed={2}
    width={900}
    height={150}
    viewBox="0 0 900 150"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <circle cx="50" cy="50" r="40" />
    <rect x="100" y="30" rx="3" ry="3" width="150" height="20" />
    <rect x="100" y="60" rx="3" ry="3" width="100" height="15" />
    <rect x="200" y="120" rx="3" ry="3" width="100" height="20" />
    <rect x="550" y="120" rx="3" ry="3" width="100" height="20" />
  </ContentLoader>
)

// 格式化日期函式，格式：yyyy/mm/dd hh:mm
function formatDate(dateString) {
  const date = new Date(dateString)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`
}

export default function UserPage() {
  const { token, user, loading } = useAuth()
  const [articles, setArticles] = useState([]) // 用於顯示篩選後的文章
  const [allArticles, setAllArticles] = useState([]) // 新增：用於統計的所有文章
  const [contentReady, setContentReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timer;
    if (user && token) {
      axios
        .get(`https://lenstudio.onrender.com/api/articles?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          const articlesData = res.data.data || [];
          setArticles(articlesData);
          setAllArticles(articlesData); // 同時設置所有文章數據
          // 添加延遲，以便骨架屏顯示足夠長的時間
          timer = setTimeout(() => {
            setContentReady(true);
          }, 500);
        })
        .catch((err) => {
          console.error(err)
          setContentReady(true); // 錯誤時也標記為準備完成
          Swal.fire({
            icon: 'error',
            title: '讀取文章失敗',
            text: err.message
          })
        })
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, token])

  if (loading) {
    return <div className="text-center mt-5">載入中...</div>
  }

  // 模擬 handleEdit/handleDelete 行為
  const handleEdit = (articleId) => {
    console.log('編輯文章 ID:', articleId) // 除錯用
    if (!articleId) {
      console.error('沒有文章 ID')
      return
    }
    router.push(`/user/article/edit-article?id=${articleId}`)
  }

  const handleDelete = (articleId) => {
    // 第一階段：初步確認
    Swal.fire({
      title: "確定要刪除這篇文章嗎？",
      text: "刪除後將無法復原。",
      icon: "warning",
      showCancelButton: true,
      // 移除原本的 confirmButtonColor/cancelButtonColor
      customClass: {
        confirmButton: "btn-custom-confirm-delete", // 自訂確認按鈕
        cancelButton: "btn-custom-cancel-delete",      // 自訂取消按鈕
        popup: "y-custom-popup"
      },
      buttonsStyling: false, // 關閉預設按鈕樣式
      confirmButtonText: "刪除",
      cancelButtonText: "取消"
    }).then((result) => {
      if (result.isConfirmed) {
        // 第二階段：再次確認，使用自訂樣式
        const swalWithCustomStyle = Swal.mixin({
          customClass: {
            confirmButton: "btn-custom-confirm-delete-2",
            cancelButton: "btn-custom-cancel-delete-2",
            popup: "y-custom-popup"
          },
          buttonsStyling: false
        });

        swalWithCustomStyle.fire({
          title: "刪除後將無法復原！",
          text: "是否確定永久刪除？",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "刪除",
          cancelButtonText: "取消",
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            // 呼叫 API 更新 is_deleted 為1
            axios.delete(`https://lenstudio.onrender.com/api/articles/${articleId}`, {
              headers: {
                Authorization: `Bearer ${token}` // token須來自 useAuth 狀態
              }
            })
              .then((res) => {
                swalWithCustomStyle.fire({
                  title: "已刪除！",
                  text: "該文章已被刪除。",
                  icon: "success",
                  customClass: {
                    confirmButton: "btn-custom-safe",  // 使用新的安全按鈕樣式
                    popup: "y-custom-popup"
                  }
                });
                // 同時更新兩個文章狀態
                setArticles(prevArticles => prevArticles.filter(a => a.id !== articleId));
                setAllArticles(prevAllArticles => prevAllArticles.map(a =>
                  a.id === articleId
                    ? { ...a, is_deleted: 1 } // 將刪除的文章標記為已刪除
                    : a
                ));
              })
              .catch((error) => {
                swalWithCustomStyle.fire(
                  "失敗",
                  "刪除文章失敗，請稍後再試。",
                  "error"
                );
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithCustomStyle.fire({
              title: "已取消",
              text: "該文章依然安全！",
              icon: "success",  // 添加成功圖標
              customClass: {
                confirmButton: "btn-custom-safe",  // 使用新的安全按鈕樣式
                popup: "y-custom-popup"
              }
            });
          }
        });
      }
    });
  };

  const handleArticleClick = (articleId) => {
    console.log('Navigating to article:', articleId) // 除錯用
    router.push(`/article/${articleId}`)
  }

  // 在 return 語句中加入骨架屏
  return (
    <div className={`container py-4 ${styles.container}`}>
      <div className={`row ${styles.marginTop}`}>
        <Sidenav />
        <div className="col-md-9">

          {/* 用戶資訊卡片 - 添加骨架屏 */}
          {!contentReady ? (
            <div className="mb-4">
              <UserInfoSkeleton />
            </div>
          ) : (
            <div className={`${styles.userInfoCard} mb-4`}>
              <div className="d-flex align-items-center">
                <img
                  src={user?.head || "/images/default-avatar.jpg"}
                  alt="使用者頭像"
                  className={styles.userAvatar}
                />
                <div className="ms-3">
                  <h5 className={styles.userName}>{user?.nickname || '使用者'}</h5>
                </div>
              </div>

              <div className={`d-flex justify-content-between mt-3 ${styles.userStats}`}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    <AnimatedCounter
                      value={allArticles
                        .filter(article => article.is_deleted === 0 || article.is_deleted === null)
                        .reduce((sum, article) => sum + (article.like_count || 0), 0)}
                    />
                  </div>
                  <div className={styles.statLabel}>獲讚數</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    <AnimatedCounter
                      value={allArticles.filter(article => article.is_deleted === 0 || article.is_deleted === null).length}
                    />
                  </div>
                  <div className={styles.statLabel}>篇文章</div>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex flex-column gap-4">
            {/* 新增文章卡片 - 始終顯示 */}
            <Link href="/user/article/add-article" style={{ textDecoration: 'none' }}>
              <div className={styles.addArticleCard} style={{ cursor: 'pointer' }}>
                <div className="text-center">
                  <div className={`${styles.addButton} mx-auto mb-3`}></div>
                  <h5>新增文章</h5>
                </div>
              </div>
            </Link>

            {/* 過濾功能 - 如果內容準備就緒才顯示 */}
            {contentReady && (
              <UserArticleFilter
                onFilterChange={(filters) => {
                  // 根據篩選條件更新文章列表
                  if (user && token) {
                    const queryParams = new URLSearchParams()
                    queryParams.append('user_id', user.id)
                    if (filters.category) {
                      queryParams.append('category', filters.category)
                    }
                    if (filters.year) {
                      queryParams.append('year', filters.year)
                    }
                    if (filters.month) {
                      queryParams.append('month', filters.month)
                    }

                    axios.get(`https://lenstudio.onrender.com/api/articles?${queryParams}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                      .then(res => {
                        setArticles(res.data.data || [])
                      })
                      .catch(error => console.error('篩選失敗：', error))
                  }
                }}
              />
            )}

            {/* 文章列表 - 加入骨架屏 */}
            {!contentReady ? (
              <>
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
              </>
            ) : (
              articles.map((article) => {
                // 轉換 tags，若為字串則 split
                const tags = typeof article.tags === 'string' && article.tags !== ''
                  ? article.tags.split(',')
                  : Array.isArray(article.tags)
                    ? article.tags
                    : [];

                // 過濾重複的 tag
                const uniqueTags = Array.from(new Set(tags));

                return (
                  <div className={styles.articleCard} key={article.id}>
                    <div className="row g-0 d-flex align-items-center">
                      <div className="col-md-7 p-4 d-flex flex-column justify-content-between">
                        <p className={styles.categoryText}>{article.category_name || 'category'}</p>
                        {/* 標題可點擊 */}
                        <h4
                          onClick={() => handleArticleClick(article.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {article.title}
                        </h4>
                        <p className="text-muted mt-3">{article.subtitle}</p>

                        <div className="hashtag mt-3">
                          {uniqueTags.length > 0 ? (
                            uniqueTags.map((tag, index) => (
                              <p key={index}>{tag}</p>
                            ))
                          ) : (
                            <p></p>
                          )}
                        </div>

                        <div className={styles['btn-date']}>
                          <div className={styles.moreBtnContainer}>
                            <button className={styles['more-btn']} onClick={(e) => e.stopPropagation()}>
                              <img
                                src="/images/article/more-origin.svg"
                                alt="more"
                                className={styles.iconOrigin}
                              />
                              <img
                                src="/images/article/more-hover.svg"
                                alt="more hover"
                                className={styles.iconHover}
                              />
                            </button>
                            <div className={styles.moreOptions}>
                              <div
                                className={styles.moreOption}
                                onClick={() => handleEdit(article.id)}
                              >
                                <img
                                  src="/images/article/edit-origin.svg"
                                  alt="編輯原圖"
                                  className={styles.iconOriginal}
                                />
                                <img
                                  src="/images/article/edit-hover.svg"
                                  alt="編輯 hover圖"
                                  className={styles.iconHover}
                                />
                                編輯
                              </div>
                              <div
                                className={styles.moreOptionDelete}
                                onClick={() => handleDelete(article.id)}
                              >
                                <img
                                  src="/images/article/delete-origin.svg"
                                  alt="刪除原圖"
                                  className={styles.iconOriginalDelete}
                                />
                                <img
                                  src="/images/article/delete-hover.svg"
                                  alt="刪除 hover 圖"
                                  className={styles.iconHoverDelete}
                                />
                                刪除
                              </div>
                            </div>
                          </div>
                          <p>
                            <strong>發布時間 :</strong>{' '}
                            {formatDate(article.created_at)}
                          </p>
                        </div>
                      </div>
                      <div
                        className="col-md-5 p-4"
                        onClick={() => handleArticleClick(article.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={article.image_path || "/images/article/gallery (2).jpg"}
                          alt="文章圖片"
                          className={styles.articleImage}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}