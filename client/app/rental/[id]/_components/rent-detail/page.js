// rent-detail

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import RentPicture from '../rent-picture/page'
import RentTabs from '../rent-tabs/page'
import RentHashtag from '../rent-hashtag/page'
import RentReviews from '../rent-reviews/page'
import RentRecommend from '../rent-recommend/page'

export default function RentDetail() {
  const { id } = useParams()
  const [rental, setRental] = useState(null)
  const [reviews, setReviews] = useState([]) // ✅ 新增評論狀態
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalFee, setTotalFee] = useState(0);
  const [originFee, setOriginFee] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null); // 🟢 儲存當前登入者 ID

  useEffect(() => {
    if (!id) return

    const fetchRentalDetail = async () => {
      try {
        // 先判斷是否登入 再決定要不要撈收藏
        const token = localStorage.getItem('loginWithToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`https://lenstudio.onrender.com/api/rental/${id}`, { headers })
        const data = await response.json()

        if (data.success) {
          setRental(data.data)
          setTotalFee(data.data.fee); // 預設顯示單日金額
          setOriginFee(data.data.fee); // 預設顯示單日金額
          setReviews(data.reviews || []) // ✅ 設定評論數據
          setRecommendations(data.recommendations) // ✅ 取得推薦商品
          if (data.user && data.user.id) {  // 🟢 確保 `user.id` 存在
            setCurrentUserId(data.user.id);
          }
        } else {
          console.error('商品資料加載失敗:', data.error)
        }
      } catch (error) {
        console.error('無法載入商品資料:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRentalDetail()
  }, [id])

  // 計算總金額
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleFeeChange = ({ originFee, totalFee }) => {
    setOriginFee(originFee);
    setTotalFee(totalFee);
  };

  if (loading) return <p className="text-center mt-5">🚀 資料載入中...</p>
  if (!rental)
    return <p className="text-center text-danger mt-5">❌ 找不到商品</p>

  return (
    <>
      <div className="container pb-5">
        <main>
          <div className="row">
            <div className="col-lg-7">
              <RentPicture images={rental.images} />
            </div>

            <div className="col-lg-5">
              <h2>
                {rental.brand} {rental.name || '無資料'}
              </h2>
              <p className="k-main-text h4 ms-2 mt-2">
                {originFee > totalFee && (
                  <small className="text-muted me-1" style={{ textDecoration: 'line-through' }}>
                    NT$ {originFee.toLocaleString()}
                  </small>
                )}
                NT$ {totalFee ? totalFee.toLocaleString() : `${rental.fee.toLocaleString()} / 天`}
              </p>
              <RentTabs rental={rental}
                onDateChange={handleDateChange}
                onFeeChange={handleFeeChange} />
              <RentHashtag hashtags={rental.hashtags} />
              <RentReviews reviews={reviews} setReviews={setReviews} currentUserId={currentUserId} />
            </div>
          </div>
        </main>
      </div>
      <div className="container-fluid k-body-2 py-5">
        {/* ✅ 直接將推薦商品傳遞到 RentRecommend */}
        <div className="container">
          <div className="col-lg-12 col-xl-10 mx-auto">
            <RentRecommend recommendations={recommendations} />
          </div>
        </div>
      </div>
    </>
  )
}
