'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import BreadcrumbDetail from './_components/breadcrumb-detail'
import TitleShareFontSize from './_components/title-share-fontSize'
import Content from './_components/content'
import Aside from './_components/aside'
import TagLikeShareBtn from './_components/tag-like-share-btn'
import ReplyInput from './_components/reply-input'
import Recommends from './_components/recommends'
import CommentsArea from './_components/comments-area'
import AOS from 'aos'
import 'aos/dist/aos.css'
import styles from './_components/content/index.module.scss'
import dynamic from 'next/dynamic'
import usePublicAuth from '../../../hooks/usePublicAuth';
import AuthModal from './_components/auth-modal'

const ReactContentLoader = dynamic(() => import('react-content-loader'), {
  ssr: false,
});

function getFontSize(size) {
  switch (size) {
    case 'small':
      return '14px'
    case 'medium':
      return '16px'
    case 'large':
      return '18px'
    default:
      return '16px'
  }
}

export default function ArticleDetail() {
  const { id } = useParams()
  // 重命名 setUser 為 setAuthUser 避免衝突
  const { token, user: authUser, isAuthenticated, setToken, setUser: setAuthUser } = usePublicAuth();
  const [fontSize, setFontSize] = useState('medium')
  const [categoryName, setCategoryName] = useState('')
  const [articleTitle, setArticleTitle] = useState('')
  const [articleSubTitle, setArticleSubTitle] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [imagePath, setImagePath] = useState('')
  // 初始狀態設定為固定內容，方便撐版面
  const [articleContent, setArticleContent] = useState('<p>載入中...</p>')
  const [article, setArticle] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [tags, setTags] = useState([])
  const [refreshComments, setRefreshComments] = useState(0)
  // 使用 articleUser 代替 user
  const [articleUser, setArticleUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const changeFontSize = (size) => {
    setFontSize(size)
  }

  // 更新登入成功的處理函數
  const handleLoginSuccess = (userData, newToken) => {
    setAuthUser(userData); // 使用重命名的函數
    setToken(newToken);
    setShowAuthModal(false);
  };

  useEffect(() => {
    // 初始化 AOS 設定
    AOS.init({
      duration: 300,
      easing: 'ease-out',
      once: true,
      offset: 50,
      delay: 100,
      anchorPlacement: 'center-center',
    })

    // 延長 setTimeout 時間以保持骨架屏顯示較久
    setTimeout(() => {
      AOS.refreshHard()
    }, 1000)

    changeFontSize('medium')

    // 開始載入資料時，設定 loading 為 true
    setLoading(true);

    fetch(`https://lenstudio.onrender.com/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.status}`)
        }
        return res.json()
      })
      .then((response) => {
        console.log('Article response:', response)
        if (response.data && response.data.title) {
          setArticle(response.data)
          setArticleTitle(response.data.title)
          setArticleSubTitle(response.data.subtitle || '')
          setCreatedAt(response.data.created_at)
          setImagePath(response.data.image_path)
          setArticleContent(response.data.content)
          setCategoryId(response.data.category_id)
          setTags(response.data.tags)
          // 直接使用 API 回傳的 user 物件
          setArticleUser(response.data.user)
          return fetch(`https://lenstudio.onrender.com/api/articles/categories`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Network response was not ok: ${res.status}`)
              }
              return res.json()
            })
            .then((categoriesResponse) => {
              console.log('Categories response:', categoriesResponse)
              const category = categoriesResponse.data.find(
                (cat) => cat.id === response.data.category_id
              )
              if (category) {
                setCategoryName(category.name)
              }
            })
        } else {
          console.error('Article data structure is incorrect:', response)
          throw new Error('Article data structure is incorrect')
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err)
      })
      .finally(() => {
        // 資料載入完成後，設定 loading 為 false
        setLoading(false);
      });
  }, [id])

  // 若有圖片則使用 IntersectionObserver 進行圖片動畫
  useEffect(() => {
    if (articleContent) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(articleContent, 'text/html')
      const images = doc.getElementsByTagName('img')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target
              img.classList.add(styles['article-image-fade'])
              const handleLoad = () => {
                img.classList.add(styles['loaded'])
              }
              if (img.complete) {
                handleLoad()
              } else {
                img.addEventListener('load', handleLoad)
              }
              observer.unobserve(img)
            }
          })
        },
        {
          threshold: 0.2,
        }
      )

      Array.from(images).forEach(img => {
        observer.observe(img)
      })

      setArticleContent(doc.body.innerHTML)

      return () => {
        observer.disconnect()
      }
    }
  }, [articleContent])

  const memoizedTags = useMemo(() => tags, [tags])

  const handleCommentSubmitted = () => {
    setRefreshComments((prev) => prev + 1)
  }

  return (
    <div className="bg-light headerPadding">
      <div className="d-flex flex-column min-vh-100 text-dark bg-light y-container">
        <section className="y-container title-main-img">
          {article && (
            <BreadcrumbDetail
              categoryName={categoryName}
              articleTitle={article.title}
              category_id={categoryId}
            />
          )}
          <TitleShareFontSize
            categoryName={categoryName}
            articleTitle={articleTitle}
            articleSubTitle={articleSubTitle}
            createdAt={createdAt}
            imagePath={imagePath}
            user={articleUser} // 傳入 user
            loading={loading}
          />
        </section>

        <div className="d-flex justify-content-between">
          {/* 為文章內容部分增加固定 minHeight 撐版面 */}
          <article className="y-article-content" style={{ minHeight: '300px' }}>
            {articleContent === '<p>載入中...</p>' ? (
              <ReactContentLoader
                speed={3}
                width="100%"
                height={1900}
                viewBox="0 0 1000 1900"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
              >
                <rect x="0" y="0" rx="5" ry="5" width="1000" height="600" />
                <rect x="0" y="630" rx="5" ry="5" width="1000" height="30" />
                <rect x="0" y="680" rx="5" ry="5" width="900" height="30" />
                <rect x="0" y="730" rx="5" ry="5" width="1000" height="30" />
                <rect x="0" y="780" rx="5" ry="5" width="900" height="30" />
                <rect x="0" y="830" rx="5" ry="5" width="1000" height="30" />
                <rect x="0" y="880" rx="5" ry="5" width="900" height="30" />
                <rect x="0" y="930" rx="5" ry="5" width="1000" height="30" />
              </ReactContentLoader>
            ) : (
              <>
                <Content content={articleContent} fontSize={getFontSize(fontSize)} />
                <TagLikeShareBtn
                  articleId={id}
                  isAuthenticated={isAuthenticated}
                  showAuthModal={() => setShowAuthModal(true)}
                />
                <ReplyInput
                  articleId={id}
                  parentId={null}
                  onCommentSubmitted={handleCommentSubmitted}
                  isAuthenticated={isAuthenticated}
                  showAuthModal={() => setShowAuthModal(true)}
                />
                <CommentsArea
                  articleId={id}
                  refreshTrigger={refreshComments}
                  isAuthenticated={isAuthenticated}
                  showAuthModal={() => setShowAuthModal(true)}
                />
              </>
            )}
          </article>
          <Aside
            categoryId={categoryId}
            tags={memoizedTags}
            title={articleTitle}
            content={articleContent}
            articleId={id}
          />
        </div>
      </div>
      <Recommends />
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}
