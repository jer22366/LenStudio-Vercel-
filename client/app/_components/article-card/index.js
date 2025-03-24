"use client"

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./ArticleCard.module.scss";
import { format } from "date-fns";
import Link from "next/link";
import ShopAllButton from "../ShopAllButton";
import { useRouter } from 'next/navigation';

// 使用 Intersection Observer 來觸發動畫
const useIntersectionObserver = (ref, options) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isVisible;
};

const ArticleCard = ({ id, category, title, date, backgroundImage, delay = 0 }) => {
  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1 });

  return (
    <Link href={`/article/${id}`} className={styles.cardLink}>
      <div ref={cardRef} className={styles.cardContainer}>
        <div
          className={`${styles.smallImgContainer} ${isVisible ? styles.animatedCard : ''}`}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            animationDelay: `${delay}s`
          }}
        >
          <div className={`${styles.cardContent} ${styles.articleSmallCardContent} ${isVisible ? styles.animatedContent : ''}`}>
            <p>{category}</p>
            <h6>{title}</h6>
            <p>{date}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const BigArticleCard = ({ id, category, title, date, backgroundImage }) => {
  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1 });

  return (
    <Link href={`/article/${id}`} className={styles.cardLink}>
      <div ref={cardRef} className={styles.cardContainer}>
        <div
          className={`${styles.homeArticleBigCard} ${isVisible ? styles.animatedCard : ''}`}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className={`${styles.cardContent} ${styles.articleBigCardContent} ${isVisible ? styles.animatedContent : ''}`}>
            <p>{category}</p>
            <h6>{title}</h6>
            <p>{date}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ArticleHomeContainer = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();  // 初始化 router

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        // 獲取最新的5篇文章
        const response = await axios.get("https://lenstudio.onrender.com/api/articles/latest?limit=5");
        if (response.data && response.data.data) {
          setArticles(response.data.data);
        }
      } catch (error) {
        console.error("獲取最新文章失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestArticles();
  }, []);

  // 格式化日期函數
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.homeArticleContainer}>
      <div className={styles.homeArticleTitle}>
        <h2>最新消息 News</h2>
        <div className={styles.desktopButton}>
          <ShopAllButton onClick={() => router.push('/article')} />
        </div>
      </div>
      {/* <div className={styles.mobileButton}>
        <ShopAllButton onClick={() => ("")} />
      </div> */}
      <div className={styles.homeArticle}>
        {loading ? (
          <div>載入中...</div>
        ) : articles.length === 0 ? (
          <div>無最新文章</div>
        ) : (
          <div className={styles.homepageArticleArea}>
            {/* 第一篇文章顯示在大卡片 */}
            {articles[0] && (
              <BigArticleCard
                id={articles[0].id}
                category={articles[0].category_name || "未分類"}
                title={articles[0].title || "無標題"}
                date={`${formatDate(articles[0].created_at)} | ${articles[0].user_nickname || articles[0].user_name || "作者"}`}
                backgroundImage={articles[0].image_path || "/images/HomePage-images/SC1.jpg"}
              />
            )}
            <div className={styles.homeArticleSmallCard}>
              {/* 剩餘4篇文章顯示在小卡片 */}
              {articles.slice(1, 5).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  category={article.category_name || "未分類"}
                  title={article.title || "無標題"}
                  date={formatDate(article.created_at)}
                  backgroundImage={article.image_path || "/images/HomePage-images/SC1.jpg"}
                  delay={0.2 * (index + 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleHomeContainer;