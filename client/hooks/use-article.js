import { useState, useEffect } from 'react'
import axios from 'axios'

const useArticles = (filter = {}) => {
  const [articles, setArticles] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        let url = 'https://lenstudio.onrender.com/api/articles'
        const queryParams = new URLSearchParams()

        if (filter.year) queryParams.append('year', filter.year) //如果有年份就加入queryParams
        if (filter.month) queryParams.append('month', filter.month) //如果有月份就加入queryParams
        if (filter.category) queryParams.append('category', filter.category) //如果有分類就加入queryParams
        if (filter.tag) queryParams.append('tag', filter.tag) //如果有標籤就加入queryParams
        if (filter.search) queryParams.append('search', filter.search) //如果有搜尋就加入queryParams
        if (filter.user_id) {
          queryParams.append('user_id', filter.user_id); // 確保 user_id 被正確添加到 URL
        }

        if (queryParams.toString()) {
          url += '?' + queryParams.toString() //如果有queryParams就加入url
        }

        const response = await axios.get(url, { withCredentials: true }) //發送請求
        let data = response.data.data //取得文章資料

        setArticles(data) //設定文章
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [JSON.stringify(filter)]) // 確保 filter 是依賴項

  return { articles, error, loading }
}

export default useArticles
