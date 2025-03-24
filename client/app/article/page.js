'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import 'bootstrap/dist/css/bootstrap.min.css'
import Breadcrumb from './_components/breadcrumb'
import LoopAd from './_components/loop-ad'
import SelectList from './_components/select-list'
import ListCard from './_components/list-card'
import Pagination from './_components/Pagination'
import '../../styles/article.css'
import useArticles from '../../hooks/use-article'
import Modal from './_components/add-article/Modal'
import MasonryLayouts from './_components/masonry-layouts'
import StickyCard from './_components/sticky-card'

export default function NewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 1. 先從 URL 參數中直接初始化 filters
  const initialFilters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    user_id: searchParams.get('user_id') || '',
  }

  // 2. 使用這些初始值設置 filters 狀態
  const [filters, setFilters] = useState(initialFilters)

  // 3. 使用已初始化的 filters 獲取文章
  const { articles, error, loading } = useArticles(filters)

  // 新增：從 URL 獲取當前頁碼，如果沒有則默認為 1
  const pageParam = searchParams.get('page')
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1

  // 使用 URL 中的頁碼初始化 currentPage
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasSearch, setHasSearch] = useState(false)

  useEffect(() => {
    // 每次 filters 改變時，重置 currentPage 為 1
    setCurrentPage(1)
  }, [filters])

  const itemsPerPage = 12
  const totalPages = articles ? Math.ceil(articles.length / itemsPerPage) : 1
  const paginatedArticles = articles
    ? articles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : []

  // 修改現有的 handlePageChange 函數
  const handlePageChange = (page) => {
    setCurrentPage(page);

    // 更新 URL，加入頁碼但保留其他搜尋參數
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());

    // 使用 { scroll: false } 避免頁面自動捲動到頂部
    router.push(`/article?${params.toString()}`, { scroll: false });

    // 使用 setTimeout 確保在 DOM 更新後執行滾動
    setTimeout(() => {
      // 檢查是否為小螢幕設備
      if (window.innerWidth <= 768) {
        // 嘗試找到 SelectList 區域的標題或容器
        const titleElement = document.querySelector('.y-list-title h2, #article-filter-section');

        if (titleElement) {
          // 滾動到該元素，使用平滑滾動效果
          titleElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          // 如果找不到特定元素，滾動到 SelectList 區域的估計位置
          window.scrollTo({
            top: document.querySelector('section.y-container').offsetTop - 20,
            behavior: 'smooth'
          });
        }
      }
    }, 200);
  };

  // 當 URL 的 search 參數改變時，更新 filters
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    const tagQuery = searchParams.get('tag');
    const userIdQuery = searchParams.get('user_id');
    const authorNameQuery = searchParams.get('author_name');
    const newFilters = {};

    const hasAnySearch = !!(searchQuery || categoryQuery || tagQuery || userIdQuery);
    setHasSearch(hasAnySearch);

    if (searchQuery) {
      newFilters.search = searchQuery;
    }
    if (categoryQuery) {
      newFilters.category = categoryQuery;
    }
    if (tagQuery) {
      newFilters.search = tagQuery;
      setSearchTerm(tagQuery);
    }
    if (userIdQuery) {
      newFilters.user_id = userIdQuery;
      newFilters.author_name = authorNameQuery || '作者';
    }
    setFilters(newFilters);
    setCurrentPage(1);
  }, [searchParams]); // 確保 searchParams 是依賴項

  // 監聽 URL 參數變化，同步更新頁碼
  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10)
      if (!isNaN(parsedPage) && parsedPage !== currentPage) {
        setCurrentPage(parsedPage)
      }
    }
  }, [searchParams, currentPage])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)

    // 當篩選條件變更時，重置為第一頁
    setCurrentPage(1)

    // 更新 URL 參數
    const params = new URLSearchParams(searchParams.toString())

    // 更新篩選條件
    for (const key in newFilters) {
      if (newFilters[key]) {
        params.set(key, newFilters[key])
      } else {
        params.delete(key)
      }
    }

    // 重置頁碼參數為 1
    params.set('page', '1')
    router.push(`/article?${params.toString()}`)
  }

  const handleTagClick = (tag) => {
    handleFilterChange({ ...filters, search: tag })
    setSearchTerm(tag)
  }

  // 搜尋功能：處理搜尋框的輸入與提交
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    handleFilterChange({ ...filters, search: searchTerm })
  }

  const handleAuthorClick = (userId, authorName) => {
    const params = new URLSearchParams();
    params.set('user_id', userId);
    params.set('author_name', authorName);
    // 清除其他搜尋條件
    router.push(`/article?${params.toString()}`);
    setFilters({ user_id: userId, author_name: authorName });
    setSearchTerm('');
  };

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js')

    const filterCollapse = document.querySelector('#filter-collapse')
    const toggleButtonIcon = document.querySelector('[data-bs-target="#filter-collapse"] i')
    const clearOptionsBtn = document.querySelector('#y-clear-options-btn')

    if (filterCollapse && toggleButtonIcon) {
      const handleShow = () =>
        toggleButtonIcon.classList.replace('fa-angle-down', 'fa-angle-up')
      const handleHide = () =>
        toggleButtonIcon.classList.replace('fa-angle-up', 'fa-angle-down')

      filterCollapse.addEventListener('show.bs.collapse', handleShow)
      filterCollapse.addEventListener('hide.bs.collapse', handleHide)

      return () => {
        filterCollapse.removeEventListener('show.bs.collapse', handleShow)
        filterCollapse.removeEventListener('hide.bs.collapse', handleHide)
      }
    }

    if (clearOptionsBtn) {
      const handleClear = () => {
        document.querySelectorAll('select').forEach((select) => {
          select.selectedIndex = 0
        })
      }
      clearOptionsBtn.addEventListener('click', handleClear)
      return () => clearOptionsBtn.removeEventListener('click', handleClear)
    }
  }, [])

  return (
    <div className='y-bg-list'>
      <Breadcrumb />
      {/* 只在沒有搜尋條件時顯示 */}
      {!hasSearch && (
        <>
          <div className="my-sm-5 y-list-title y-container d-flex justify-content-between">
            <h1>最新消息 News</h1>
          </div>
          <div className="y-bg-use">
            <div className="y-page-container">
              <StickyCard className="Sticky-Card" />
              <MasonryLayouts />
            </div>
          </div>
        </>
      )}

      <section className="y-container">
        {/* 搜尋表單 */}
        <SelectList onFilterChange={(newFilters) => setFilters(newFilters)} />

        {/* 搜尋無結果訊息 */}
        {hasSearch && articles && articles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              margin: '100px auto',
              color: '#777',
              fontWeight: '500',
              fontSize: '18px'
            }}
          >
            <p>找不到關於「{filters.search || filters.author_name || ''}」的文章</p>
          </div>
        ) : (
          <>
            {/* 卡片區 */}
            <div className="row">
              {paginatedArticles.map((article) => (
                <div key={article.id} className="col-12 col-md-6 col-lg-3">
                  <ListCard
                    article={article}
                    onTagClick={handleTagClick}
                    onAuthorClick={handleAuthorClick}
                    searchTerm={searchTerm}
                  />
                </div>
              ))}
            </div>

            {/* 分頁區 - 只有當有文章且總頁數大於1時才顯示 */}
            {articles && articles.length > 0 && totalPages > 1 && (
              <div className="d-flex justify-content-center mb-5">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}