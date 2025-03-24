// rent-reviews

'use client'

import { useState } from 'react'
import { IoStar, IoStarHalf, IoStarOutline } from 'react-icons/io5'
import { FaRegPenToSquare } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import StarRating from '../rent-rating/page'
import withReactContent from 'sweetalert2-react-content'
import ReactDOM from 'react-dom/client'

const MySwal = withReactContent(Swal)

export default function RentReviews({ reviews = [] }) {
  const [itemsPerPage, setItemsPerPage] = useState(3)
  const [reviewList, setReviewList] = useState(reviews) // ✅ 用於局部刷新評論列表

  // 📌計算平均評分
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0

  // 📌計算星星顯示（包括半星處理）
  const getStarDisplay = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i - 0.3) {
        stars.push(<IoStar key={i} className="k-warn-text" />)
      } else if (rating >= i - 0.8) {
        stars.push(<IoStarHalf key={i} className="k-warn-text" />)
      } else {
        stars.push(<IoStarOutline key={i} className="k-warn-text" />)
      }
    }
    return <span>{stars}</span>
  }

  // 📌顯示更多評論 (每次顯示3條)
  const showMore = () => {
    setItemsPerPage(itemsPerPage + 3)
  }

  // 📌 格式化時間 (帶完整DateTime 但只顯示 YYYY/MM/DD)
  const formatDate = (timestamp) => {
    if (!timestamp) return '未設定';

    // 📌 確保時間解析為本地時間
    const date = new Date(timestamp);

    // ✅ 保留完整時間，但 UI 只顯示 YYYY/MM/DD
    return {
      full: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
      display: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
    };
  };

  // 📌 格式化時間
  const toSwalDateTime = (timestamp) => {
    if (!timestamp) return '';

    // 📌 確保時間解析為本地時間
    const date = new Date(timestamp);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };


  // 📌 編輯評論 (SweetAlert2 彈窗 + 星星評分)
  const handleEdit = async (review) => {

    // 📌 確保評論 ID 存在
    if (!review.id) {
      Swal.fire('錯誤', '評論 ID 缺失，無法編輯', 'error');
      console.error('❌ 缺少 reviewId，無法編輯評論！');
      return;
    }

    const rentId = review.rent_id;
    let currentRating = review.rating;
    let selectedUserId = review.user_id;

    let userOptions = [], userMap = {};

    // 🚦 從後端獲取 level = 0 的所有會員 (新 API)
    try {
      const res = await fetch(`https://lenstudio.onrender.com/api/rental-master/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('loginWithToken')}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        userOptions = data.users.map(user =>
          `<option value="${user.user_id}" ${user.user_id === review.user_id ? 'selected' : ''}>${user.name}</option>`
        );

        // 生成用戶ID到頭像和名字的映射
        userMap = data.users.reduce((acc, user) => {
          acc[user.user_id] = { name: user.name, avatar: user.avatar };
          return acc;
        }, {});
      }
    } catch (error) {
      console.error('❌ 獲取會員列表失敗:', error);
    }

    MySwal.fire({
      didOpen: () => {
        // comment-at 輸入框
        document.getElementById('clear-date').addEventListener('click', () => {
          document.getElementById('comment-at').value = ''; // 清空輸入框
        });
        // 星星評分元件的初始化
        const container = document.getElementById('star-rating')
        if (container) {
          const root = ReactDOM.createRoot(container)
          root.render(
            <StarRating
              rating={currentRating}
              setRating={(value) => {
                currentRating = value
              }}
            />
          )
        }
        // 當下拉選單變更時，動態更新頭像與名字
        document.getElementById('user-select').addEventListener('change', (e) => {
          selectedUserId = parseInt(e.target.value);
          const user = userMap[selectedUserId];
          document.getElementById('user-name').textContent = user.name;
          document.getElementById('user-avatar').src = user.avatar;
        });
      },
      color: '#fff',
      background: '#23425a',
      title: '編輯評論',
      html: `
        <div class="form-group">
          <label class="my-2 d-block k-swal-label">評論者</label>
          
          <select id="user-select" class="form-select">${userOptions.join('')}</select>

          <div class="my-2 d-flex align-items-center">
            <img 
              id="user-avatar" 
              src="${review.avatar}" 
              class="rounded-circle me-2" 
              width="50" 
              height="50"
              onerror="this.src='/uploads/users.webp'"
            />
            <strong id="user-name">${review.name}</strong>
          </div>

          <label class="my-2 d-block k-swal-label">留言時間</label>
          <div class="input-group">
              <input type="datetime-local" id="comment-at" class="form-control" value="${toSwalDateTime(review.comment_at)}" step="1"/>
              <button id="clear-date" class="btn btn-danger">x</button>
          </div>

          <label class="my-2 d-block k-swal-label">評論內容</label>
          <textarea id="comment" class="form-control" rows="3">${review.comment}</textarea>
          <label class="my-2 d-block k-swal-label">評分</label>
          <div id="star-rating"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '儲存',
      cancelButtonText: '取消',
      focusConfirm: false,
      customClass: {
        actions: 'd-flex justify-content-ends k-review-swal-actions',
        popup: 'k-review-swal-popup',
        confirmButton: 'k-review-swal-btn-1',
        cancelButton: 'k-review-swal-btn-2'
      },
      preConfirm: () => {
        const comment = document.getElementById('comment').value

        if (!comment || currentRating < 1 || currentRating > 5) {
          Swal.showValidationMessage('評論內容不得為空，評分必須在 1 到 5 之間')
          return false
        }

        if (!review.id) {
          console.error('❌ 缺少 reviewId，無法更新評論！');
          return false;
        }
        return {
          comment,
          rating: currentRating,
          reviewId: review.id, // 使用評論的唯一 ID
          rentId: review.rent_id,  // 商品ID 被傳遞
          newUserId: selectedUserId, // 新的評論者 ID
          commentAt: document.getElementById('comment-at').value || null // 清空時傳 null
        };
      },
    }).then(async (result) => {
      // 📌 獲取最新評論列表的 API 函數 (使用新的 API)
      const fetchReviews = async (rentId) => {

        if (!rentId) {
          console.error('❌ 無效的 rent_id，無法發送 API 請求');
          return;
        }

        try {
          const res = await fetch(`https://lenstudio.onrender.com/api/rental-master/reviews/${rentId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('loginWithToken')}`,
            },
          });

          if (!res.ok) {
            console.error('❌ 無法取得評論列表:', res.statusText, 'HTTP狀態碼:', res.status);
            return;
          }

          const data = await res.json();

          if (data.success && Array.isArray(data.reviews)) {
            setReviewList(data.reviews.map(review => ({
              ...review,
              comment_at: review.comment_at ? toSwalDateTime(review.comment_at) : null // 確保 null 值正確處理
            })));
          }
        } catch (error) {
          console.error('❌ 取得評論列表失敗:', error);
        }
      };

      if (result.isConfirmed) {
        console.log('🚦 正在發送更新評論請求:', result.value)
        try {
          const res = await fetch(
            `https://lenstudio.onrender.com/api/rental-master/reviews`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem(
                  'loginWithToken'
                )}`,
              },
              body: JSON.stringify(result.value),
            }
          )

          if (!res.ok) {
            console.error('❌ API 錯誤訊息:', errorResponse.error)
            throw new Error(`儲存評論失敗: ${res.status}`)
          }

          Swal.fire('成功', '評論已成功更新', 'success')
          // window.location.reload() // 🟢 重新加載頁面，或改為用狀態更新評論列表

          await fetchReviews(result.value.rentId)

        } catch (error) {
          console.error('❌ 更新評論失敗:', error)
          Swal.fire('錯誤', '無法儲存評論，請稍後重試', 'error')
        }
      }
    })
  }

  return (
    <div className="mt-4">
      <h5>評價</h5>
      <div className="d-flex align-items-center">
        <span className="k-star">{getStarDisplay(averageRating)}</span>
        <span className="k-warn-text ms-2">{averageRating.toFixed(1)} 分</span>
        <span className="ms-2">{reviews.length} 條評論</span>
      </div>
      <div className="mt-3" id="reviewContainer">
        {reviewList.slice(0, itemsPerPage).map((review, index) => (
          <div key={index} className="border p-3 mb-3 d-flex">
            <img
              src={review.avatar || '/uploads/users.webp'}
              alt={review.name}
              onError={(e) => e.target.src = '/uploads/users.webp'}
              className="rounded-circle me-3"
              width="50"
              height="50"
            />
            <div>
              <strong className="me-1">{review.name}</strong>
              <small className="text-muted" title={review.comment_at ? formatDate(review.comment_at).full : ''}>
                {review.comment_at ? formatDate(review.comment_at).display : <span className="k-no-time">🚫</span>}
              </small>

              <span>
                <FaRegPenToSquare
                  className="k-main-text cursor-pointer k-pen ms-1"
                  onClick={() => handleEdit(review)}
                />
              </span>

              <p>
                {review.comment.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <span className='k-star'>{getStarDisplay(review.rating)}</span>

            </div>
          </div>
        ))}

        {itemsPerPage < reviews.length && (
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-outline-warning k-main-radius"
              onClick={showMore}
            >
              顯示更多
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
