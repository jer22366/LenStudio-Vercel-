'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './index.module.scss';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function MasonryLayouts() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    AOS.init({ once: true });

    const fetchArticles = async () => {
      try {
        // 只取 user_id=48 的文章資料
        const response = await fetch('https://lenstudio.onrender.com/api/articles?user_id=48');
        const json = await response.json();
        const allArticles = json.data || json;
        // 取得 StickyCard 儲存的 stickyArticleId
        const stickyArticleId = localStorage.getItem('stickyArticleId');
        // 過濾掉 sticky 文章（若有設定 stickyArticleId）
        const filteredArticles = stickyArticleId
          ? allArticles.filter(article => article.id !== Number(stickyArticleId)) // 轉換為數字後再比較
          : allArticles;
        setArticles(filteredArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  // 左欄顯示前 4 筆，右欄顯示接續 4 筆文章（不足則依實際數量）
  const leftArticles = articles.slice(0, 4);
  const rightArticles = articles.slice(4, 8);

  const handleArticleClick = (articleId) => {
    router.push(`/article/${articleId}`);
  };

  // renderCard 根據 variant 決定使用小圖或大圖（調整順序由設計決定）
  const renderCard = (article, variant) => (
    <div
      className="article-card pb-3"
      key={article.id}
      data-aos="fade-in"
      data-aos-duration="400"
    >
      {variant === 'small' ? (
        <div
          className={styles["article-card-2-image"]}
          onClick={() => handleArticleClick(article.id)}
          style={{ cursor: 'pointer' }}
          data-aos="fade-in"
          data-aos-delay="0"
          data-aos-duration="400"
        >
          <img src={article.image_path} alt="" className="w-full h-auto" />
        </div>
      ) : (
        <div
          className={styles["article-card-1-image"]}
          onClick={() => handleArticleClick(article.id)}
          style={{ cursor: 'pointer' }}
          data-aos="fade-in"
          data-aos-delay="0"
          data-aos-duration="400"
        >
          <img src={article.image_path} alt="" className="w-full h-auto" />
        </div>
      )}
      <div
        className={styles["article-card-content"]}
        data-aos="fade-in"
        data-aos-delay="0"
        data-aos-duration="300"
      >
        <div className={styles["article-card-category"]}>
          <a href="">{article.category_name}</a>
        </div>
        <h5
          className={styles["article-card-title"]}
          onClick={() => handleArticleClick(article.id)}
          style={{ cursor: 'pointer' }}
        >
          <Link href={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h5>
        <div className={styles["article-card-author-date"]}>
          <p className={styles["author-date-1"]}>
            {article.nickname ? article.nickname : article.author_name}
          </p>
          <p className={styles["author-date-2"]}>
            {new Date(article.created_at).toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${styles.container} d-flex justify-content-between `}>
      <div className={`${styles["article-list-card-area"]} d-flex justify-content-center `}>
        {/* 左欄：依序排列 小、大、小、大 */}
        <div className="left me-4">
          {leftArticles.map((article, index) => {
            const variant = index % 2 === 0 ? 'small' : 'big';
            return renderCard(article, variant);
          })}
        </div>
        {/* 右欄：依序排列 大、小、大、小 */}
        <div className="right ms-4">
          {rightArticles.map((article, index) => {
            const variant = index % 2 === 0 ? 'big' : 'small';
            return renderCard(article, variant);
          })}
        </div>
      </div>
    </div>
  );
}