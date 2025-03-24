// rent-favorite

"use client"

import { useState, useEffect } from 'react'
import { FaRegHeart, FaHeart } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import { Howl } from 'howler'

export default function FavoriteButton({ rentId, rental }) {

  // 📌 直接從 `rental.is_favorite` 取得初始狀態
  const [isFavorite, setIsFavorite] = useState(rental.is_favorite)

  // ✅ 阻止事件冒泡，避免觸發卡片點擊事件
  const toggleFavorite = async (e) => {
    e.stopPropagation()

    const token = localStorage.getItem('loginWithToken')

    // 錯誤音效
    const falseSound = new Howl({
      src: ['/sounds/false.mp3'], // 音效來源 (支援多格式陣列)
      volume: 0.4, // 調整音量 (0.0 ~ 1.0)
      loop: false // 是否重複播放
    });

    if (!token) {
      Swal.fire({
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            const decorationBar = document.createElement('div');
            decorationBar.className = 'k-auth-swal-top-bar'; // 添加裝飾條的類別
            popup.prepend(decorationBar); // 在視窗頂部插入裝飾條
          }
          falseSound.play(); // 播放音效
        },
        color: '#fff',
        icon: 'warning',
        iconColor: '#fff',
        title: '請先登入',
        text: '登入後即可收藏商品',
        background: '#23425a',
        confirmButtonText: '前往登入',
        cancelButtonText: '稍後前往',
        showCancelButton: true,
        customClass: {
          icon: 'k-auth-swal-icon',
          popup: 'k-auth-swal-popup',
          confirmButton: 'k-auth-swal-btn-1',
          cancelButton: 'k-auth-swal-btn-2'
        },
        willClose: () => {
          falseSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'
        }
      })
      return
    }

    try {
      const response = await fetch(`https://lenstudio.onrender.com/api/rental/collection`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rent_id: rentId }),
      })

      const data = await response.json()

      // 收藏音效
      const favoriteSound = new Howl({
        src: ['/sounds/collection.mp3'], // 音效來源 (支援多格式陣列)
        volume: 0.5, // 調整音量 (0.0 ~ 1.0)
        loop: false // 是否重複播放
      });
      const unFavoriteSound = new Howl({
        src: ['/sounds/uncollection.mp3'], // 音效來源 (支援多格式陣列)
        volume: 0.5, // 調整音量 (0.0 ~ 1.0)
        loop: false // 是否重複播放
      });

      if (data.success) {
        setIsFavorite(!isFavorite)  // ✅ 只影響自己

        Swal.fire({
          didOpen: () => {
            isFavorite ? unFavoriteSound.play() : favoriteSound.play(); // 播放音效
          },
          color: '#fff',
          icon: 'success',
          iconColor: '#fff',
          iconHtml: isFavorite ? `<img src="/images/icon/unfavorite.svg" alt="已取消收藏圖示" class="k-swal-toast-icon">` : `<img src="/images/icon/favorite.svg" alt="已加入收藏圖示" class="k-swal-toast-icon">`,
          background: '#23425a',
          html: isFavorite ? `<strong>${rental?.brand !== null ? `${rental?.brand} ` : ''}${rental?.name}</strong><br>已取消收藏` :
            `<strong>${rental?.brand !== null ? `${rental?.brand} ` : ''}${rental?.name}</strong><br>已加入收藏`,
          showConfirmButton: false,
          timerProgressBar: true,
          showCloseButton: true,
          closeButtonHtml: '&times;', // "×" 符號
          timer: 1450,
          toast: true,
          position: 'top-end',
          customClass: {
            icon: 'k-swal-toast-icon',
            popup: 'k-swal-toast-popup',
            closeButton: 'k-swal-toast-close',
            timerProgressBar: 'k-swal-toast-progress'
          },

        })
      } else {
        Swal.fire({
          didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) {
              const decorationBar = document.createElement('div');
              decorationBar.className = 'k-error-swal-top-bar';
              popup.prepend(decorationBar); // 裝飾條
            }
            falseSound.play();
          },
          color: '#fff',
          icon: 'error',
          iconColor: '#fff',
          title: '操作失敗',
          text: data.error || '無法進行收藏操作',
          background: '#807871',
          confirmButtonText: '我知道了',
          customClass: {
            icon: 'k-error-swal-icon',
            popup: 'k-error-swal-popup',
            confirmButton: 'k-error-swal-btn',
          },
          willClose: () => {
            falseSound.stop(); // 關閉視窗時停止音效 (適用長音效)
          }
        })
      }
    } catch (error) {
      console.error('收藏操作失敗:', error)
      Swal.fire({
        icon: 'error',
        title: '操作失敗',
        text: '請稍後再試',
      })
    }
  }

  return (
    <button onClick={toggleFavorite} className='k-favorite-icon'>
      {isFavorite ? (

        <FaHeart size={22} color="#ca6d1b" /> // ✅ 實心愛心 (已收藏)
      ) : (
        <FaRegHeart size={22} color="#ca6d1b" /> // ✅ 空心愛心 (未收藏)
      )}
    </button>
  )
}
