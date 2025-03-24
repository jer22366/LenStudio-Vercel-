'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '@/hooks/use-auth';
import axios from 'axios';

const ArticleContext = createContext();

export function ArticleProvider({ children }) {
  const { token, user } = useAuth();
  const [userArticles, setUserArticles] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [activeArticleCount, setActiveArticleCount] = useState(0);

  // 初始化加載用戶所有文章
  useEffect(() => {
    if (user?.id && token) {
      loadUserArticles();
    }
  }, [user?.id, token]);

  // 加載用戶所有文章
  const loadUserArticles = async () => {
    try {
      const res = await axios.get(`https://lenstudio.onrender.com/api/articles?user_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const articles = res.data.data || [];
      setUserArticles(articles);

      // 計算活躍文章和總讚數
      updateArticleStats(articles);
    } catch (err) {
      console.error('無法載入用戶文章:', err);
    }
  };

  // 更新文章統計數據
  const updateArticleStats = (articles) => {
    const activeArticles = articles.filter(article =>
      article.is_deleted === 0 || article.is_deleted === null
    );

    const likes = activeArticles.reduce((sum, article) =>
      sum + (article.like_count || 0), 0
    );

    setTotalLikes(likes);
    setActiveArticleCount(activeArticles.length);
  };

  // 更新單篇文章的按讚狀態
  const updateArticleLike = (articleId, isLiked, changeAmount) => {
    setUserArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const newLikeCount = article.like_count + changeAmount;
        return {
          ...article,
          is_liked: isLiked,
          like_count: newLikeCount >= 0 ? newLikeCount : 0
        };
      }
      return article;
    }));

    // 同時更新總統計
    setTotalLikes(prev => {
      const newTotal = prev + changeAmount;
      return newTotal >= 0 ? newTotal : 0;
    });
  };

  // 刪除文章
  const markArticleAsDeleted = (articleId) => {
    setUserArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        return { ...article, is_deleted: 1 };
      }
      return article;
    }));

    // 更新統計
    updateArticleStats(userArticles);
  };

  return (
    <ArticleContext.Provider
      value={{
        userArticles,
        totalLikes,
        activeArticleCount,
        updateArticleLike,
        markArticleAsDeleted,
        refreshArticles: loadUserArticles
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
}

export const useArticleContext = () => useContext(ArticleContext);