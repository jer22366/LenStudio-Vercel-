// rent-detail

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalFee, setTotalFee] = useState(0);
  const [originFee, setOriginFee] = useState(0);
  const [user, setUser] = useState(null); // 用戶資訊 (包含 level 權限)
  const [loading, setLoading] = useState(true); // 載入狀態
  const router = useRouter(); // ✅ 正確初始化 router

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('loginWithToken');
        if (!token) {
          console.warn('沒有 Token，跳轉到登入頁面');
          router.push('/login');
          return;
        }

        console.log('正在驗證用戶身份...');
        const res = await fetch('https://lenstudio.onrender.com/api/rental-master/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`API 錯誤: ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ 取得用戶資訊:', data);

        if (!data || data.user?.level === undefined) {
          console.error('❌ API 回傳錯誤，沒有 level 資訊', data);
          router.push('/');
          return;
        }

        setUser(data.user); // 🟢 設置正確的 user 資料

        if (data.user.level !== 99) {
          console.warn('⚠️ 權限不足，只有管理員 (Level 99) 才能進入此頁面，跳轉到 /');
          router.push('/');
        }
      } catch (error) {
        console.error('❌ 獲取用戶資訊失敗:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (!id) return

    const fetchRentalDetail = async () => {
      try {
        // 先判斷是否登入 再決定要不要撈收藏
        const token = localStorage.getItem('loginWithToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log(`Fetching rental detail: https://lenstudio.onrender.com/api/rental/${id}`)


        const response = await fetch(`https://lenstudio.onrender.com/api/rental/${id}`, { headers })
        const data = await response.json()

        console.log("API Response:", data) // ✅ 確保 API 回應正確

        if (data.success) {
          setRental(data.data)
          setTotalFee(data.data.fee); // 預設顯示單日金額
          setOriginFee(data.data.fee); // 預設顯示單日金額
          setReviews(data.reviews || []) // ✅ 設定評論數據
          setRecommendations(data.recommendations) // ✅ 取得推薦商品
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
    console.log('Date updated:', start, end);
    setStartDate(start);
    setEndDate(end);
  };

  const handleFeeChange = ({ originFee, totalFee }) => {
    console.log('Fee updated - Original:', originFee, 'Discounted:', totalFee);
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
              <RentReviews reviews={reviews} />
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
