// rent-shopping

"use client";

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Howl } from 'howler'
import { RiInformationFill } from "react-icons/ri";



export default function RentShopping({ rental, onDateChange, onFeeChange }) {
  // 日期相關的狀態
  const [startDate, setStartDate] = useState('') // 選擇的開始日期
  const [endDate, setEndDate] = useState('')     // 選擇的結束日期
  const [totalFee, setTotalFee] = useState(0); // 總金額（初始為 0）
  const [originFee, setOriginFee] = useState(0); // 原始總金額（不含折扣）

  // 開始日期的範圍
  const [minStartDate, setMinStartDate] = useState('')
  const [maxStartDate, setMaxStartDate] = useState('')

  // 結束日期的範圍
  const [minEndDate, setMinEndDate] = useState('')
  const [maxEndDate, setMaxEndDate] = useState('')

  // 禁用的日期 (所有星期日)
  const [disabledDates, setDisabledDates] = useState([])

  useEffect(() => {
    console.log("rental data:", rental);
  }, [rental]);

  useEffect(() => {
    const today = new Date()

    // 🛠️設置開始日期的最小值 (今天 +3 天)
    today.setDate(today.getDate() + 3) // 今天 + 3 天
    const minStart = today.toISOString().split('T')[0]
    setMinStartDate(minStart)

    // 🛠️ 設置開始日期的最大值 (今天 +90 天)
    const maxStart = new Date()
    maxStart.setDate(maxStart.getDate() + 90) // 今天 + 90 天
    setMaxStartDate(maxStart.toISOString().split('T')[0])

    // 生成未來 6 個月內的所有星期日作為禁用日期
    setDisabledDates(generateDisabledSundays())
  }, [])

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value
    setStartDate(newStartDate)

    // 設置結束日期的最小值 (開始日期 + 1 天)
    const minEnd = new Date(newStartDate)
    minEnd.setDate(minEnd.getDate() + 1)
    setMinEndDate(minEnd.toISOString().split('T')[0])

    // 設置結束日期的最大值 (開始日期 + 90 天)
    const maxEnd = new Date(newStartDate)
    maxEnd.setDate(maxEnd.getDate() + 90)
    setMaxEndDate(maxEnd.toISOString().split('T')[0])
  }

  useEffect(() => {
    // 當開始日期未選擇時，設置結束日期的初始範圍
    if (!startDate && !endDate) {
      const today = new Date()

      // 🛠️ 設置結束日期的最小值 (今天 + 4 天)
      const minEnd = new Date(today)
      minEnd.setDate(minEnd.getDate() + 4) // 保持與 startDate +3 一致
      setMinEndDate(minEnd.toISOString().split('T')[0])

      // 🛠️ 設置結束日期的最大值 (今天 + 180 天)
      const maxEnd = new Date(today)
      maxEnd.setDate(maxEnd.getDate() + 180) // 最大 180 天
      setMaxEndDate(maxEnd.toISOString().split('T')[0])

      // 自動設定結束日期為合理的最小值
      // setEndDate(minEnd.toISOString().split('T')[0])
    }
  }, [startDate])

  useEffect(() => {
    if (new Date(endDate) < new Date(minEndDate) ||
      new Date(endDate) > new Date(maxEndDate)) {
      // 💡 使用防抖技術，確保狀態更新 100% 成功
      const timeout = setTimeout(() => {
        // 當結束日期無效時，自動設置為最小可選日期 (但避免星期日)
        let newEndDate = minEndDate

        // 🛠️ 如果最小可選日期 (minEndDate) 是星期日，自動跳到星期一
        const minEnd = new Date(minEndDate)
        if (minEnd.getUTCDay() === 0) { // 0 代表星期日
          minEnd.setDate(minEnd.getDate() + 1)
          newEndDate = minEnd.toISOString().split('T')[0]
        }

        setEndDate(newEndDate) // 重置為最小可選日期

      }, 50) // 延遲 100ms 確保 React 狀態更新完成

      return () => clearTimeout(timeout) // 清除上一次的計時器，避免重複觸發
    }
  }, [endDate, minEndDate, maxEndDate])

  // 🛠️ 檢查是否為星期日 (台北時間)
  const isSunday = (dateStr) => {
    const date = new Date(dateStr)
    return date.getUTCDay() === 0 // 0 代表星期日 (Sunday)
  }

  // 🛠️ 生成未來 6 個月內的所有星期日 (禁用日期)
  const generateDisabledSundays = () => {
    const disabledDates = []
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6) // 設置最大日期 (例如半年內)

    while (today <= maxDate) {
      if (isSunday(today.toISOString().split('T')[0])) {
        disabledDates.push(today.toISOString().split('T')[0])
      }
      today.setDate(today.getDate() + 1)
    }
    return disabledDates
  }

  // 🧮 計算總金額，包含禮拜日的折扣邏輯
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let normalDays = 0; // 非星期日的天數
      let sundayDays = 0; // 星期日的天數

      // 🗓️ 迴圈計算日期區間內的每一天
      const currentDate = new Date(start);
      while (currentDate <= end) {
        if (currentDate.getUTCDay() === 0) {
          sundayDays++; // 是星期日
        } else {
          normalDays++; // 是一般日
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('一般日天數:', normalDays, '星期日天數:', sundayDays);

      // 計算原始總金額（無折扣）
      const originDays = normalDays + sundayDays;
      const calculatedOriginFee = originDays * rental.fee;
      setOriginFee(calculatedOriginFee);

      // 計算總金額，星期日價格為原價的一半
      const calculatedFee = (normalDays * rental.fee) + (sundayDays * rental.fee * 0.5);
      setTotalFee(calculatedFee);

      console.log('總金額計算:', calculatedFee);

      // 更新父元件資料，傳遞原始金額與折扣後金額
      onDateChange(startDate, endDate);
      onFeeChange({ originFee: calculatedOriginFee, totalFee: calculatedFee });
    } else {
      setTotalFee(0);
      setOriginFee(0);
      onFeeChange({ originFee: 0, totalFee: 0 });
    }
  }, [startDate, endDate, rental.fee, onDateChange, onFeeChange]);

  // 📜 租借須知
  const handleShowPolicy = () => {
    Swal.fire({
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          const decorationBar = document.createElement('div');
          decorationBar.className = 'k-policy-swal-top-bar'; // 添加裝飾條的類別
          popup.prepend(decorationBar); // 在視窗頂部插入裝飾條
        }
      },
      color: '#fff',
      icon: 'info',
      iconColor: '#fff',
      title: '租借須知',
      html: `
      <p class="mb-1">請確認並遵守租借條款，避免產生額外費用。</p>
      <ul style="text-align: left; padding-left: 71px;">
        <li>請留意配送時間，請勿造成人員不便。</li>
        <li>週日由於物流無法配，故無法下單。</li>
        <li>租借日若包含週日，給予當日半價優惠。</li>
        <li>若有損壞，可能需支付維修費。</li>
        <li>超過租期未歸還，將依超時費用計算。</li>
      </ul>
    `,
      background: '#23425a',
      confirmButtonText: '瞭解',
      customClass: {
        icon: 'k-policy-swal-icon',
        popup: 'k-policy-swal-popup',
        title: 'k-policy-swal-title',
        confirmButton: 'k-policy-swal-btn'
      }
    });
  };

  // 🚀 直接租借邏輯
  const handleRentNow = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('loginWithToken') : null

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
        text: '登入後即可租借商品',
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

    // 驗證日期是否已選擇
    if (!startDate || !endDate) {
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
        title: '請選擇租借日期',
        text: '開始與結束日期皆為必填項目',
        confirmButtonText: '前往填寫',
        background: '#23425a',
        customClass: {
          icon: 'k-auth-swal-icon',
          popup: 'k-auth-swal-popup',
          confirmButton: 'k-auth-swal-btn-1',
        },
        willClose: () => {
          falseSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
        }
      })
      return
    }

    // 解析現有的購物車內容
    const cart = JSON.parse(localStorage.getItem('rent_cart')) || []
    const existingItem = cart.find((item) => item.rentalId === rental.id)

    // 傳遞圖片
    const imageUrl = rental?.images?.[0]
      ? `images/rental/${rental.images[0]}`
      : '/images/rental/test/Leica-Q3-0.png' // 當沒有圖片時顯示預設圖片 


    if (existingItem) {
      existingItem.start = startDate
      existingItem.end = endDate
      existingItem.image = imageUrl // 🆕 更新圖片資料
      existingItem.fee = totalFee; // 直接將計算後的總金額傳遞
    } else {
      cart.push({
        rentalId: rental.id,
        brand: rental.brand,
        name: rental.name,
        fee: totalFee, // 傳遞運算過的總金額（折扣後）
        start: startDate,
        end: endDate,
        image: imageUrl // 🆕 新增圖片資料
      })
    }

    localStorage.setItem('rent_cart', JSON.stringify(cart))

    // 🚀 直接跳轉到 `/cart`
    window.location.href = '/cart';
  }

  // 🛒 加入購物車邏輯
  const handleAddToCart = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('loginWithToken') : null

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
        text: '登入後即可租借商品',
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

    // 驗證日期是否已選擇
    if (!startDate || !endDate) {
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
        title: '請選擇租借日期',
        text: '開始與結束日期皆為必填項目',
        confirmButtonText: '前往填寫',
        background: '#23425a',
        customClass: {
          icon: 'k-auth-swal-icon',
          popup: 'k-auth-swal-popup',
          confirmButton: 'k-auth-swal-btn-1',
        },
        willClose: () => {
          falseSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
        }
      })
      return
    }

    // 解析現有的購物車內容
    const cart = JSON.parse(localStorage.getItem('rent_cart')) || []
    const existingItem = cart.find((item) => item.rentalId === rental.id)

    // 傳遞圖片
    const imageUrl = rental?.images?.[0]
      ? `images/rental/${rental.images[0]}`
      : '/images/rental/test/Leica-Q3-0.png' // 當沒有圖片時顯示預設圖片 


    if (existingItem) {
      existingItem.start = startDate
      existingItem.end = endDate
      existingItem.image = imageUrl // 🆕 更新圖片資料
      existingItem.fee = totalFee; // 直接將計算後的總金額傳遞
    } else {
      cart.push({
        rentalId: rental.id,
        brand: rental.brand,
        name: rental.name,
        fee: totalFee, // 傳遞運算過的總金額（折扣後）
        start: startDate,
        end: endDate,
        image: imageUrl // 🆕 新增圖片資料
      })
    }

    localStorage.setItem('rent_cart', JSON.stringify(cart))

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
      })
    }

    const successSound = new Howl({
      src: ['/sounds/cha-ching.mp3'], // 音效來源 (支援多格式陣列)
      volume: 0.5, // 調整音量 (0.0 ~ 1.0)
      loop: false // 是否重複播放
    });

    Swal.fire({
      didOpen: () => {
        successSound.play(); // 播放音效
      },
      color: '#fff',
      icon: 'success',
      iconColor: '#fff',
      iconHtml: `<img src="/images/icon/cart-2.svg" alt="加入購物車成功圖示" class="k-swal-toast-icon">`,
      background: '#23425a',
      html: `<strong>${rental?.brand !== null ? `${rental?.brand} ` : ''}${rental?.name}</strong><br>
      租借時段 ${formatDate(startDate)} ~ ${formatDate(endDate)}`,
      showConfirmButton: false,
      timerProgressBar: true,
      showCloseButton: true,
      closeButtonHtml: '&times;', // 自訂關閉按鈕顯示的內容 (例如 "×" 符號)
      timer: 2000,
      toast: true,
      position: 'top-end',
      customClass: {
        icon: 'k-swal-toast-icon',
        popup: 'k-swal-toast-popup',
        closeButton: 'k-swal-toast-close',
        timerProgressBar: 'k-swal-toast-progress'
      },
      willClose: () => {
        successSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
      }
    })
  }

  return (
    <div className="mt-3">
      <h5 className="card-title k-main-text"><span>租借時段</span>
        <button
          className="k-policy-btn"
          onClick={handleShowPolicy}
        >
          <RiInformationFill />

        </button>
      </h5>
      <div className="mt-2 m-3">
        <label htmlFor="startDate">開始日期</label>
        <input
          type="date"
          id="startDate"
          className="form-control mb-2"
          value={startDate}
          min={minStartDate}
          max={maxStartDate}
          onChange={handleStartDateChange}
        />
        {/* 提示禁止選擇星期日 */}
        {isSunday(startDate) && (
          <div className="k-warn-text  my-1">
            ⚠️ 週日恕無法配送 &gt; &lt; 請選其他日期
          </div>
        )}
        <label htmlFor="endDate">結束日期</label>
        <input
          type="date"
          id="endDate"
          className="form-control mb-2"
          value={endDate}
          min={minEndDate}
          max={maxEndDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {/* 提示禁止選擇星期日 */}
        {isSunday(endDate) && (
          <div className="k-warn-text  mt-1">
            ⚠️ 週日恕無法取回 &gt; &lt; 請選其他日期
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end m-1">
        <button
          className="btn btn-primary k-main-radius me-1"
          onClick={handleRentNow}
          disabled={
            isSunday(startDate) ||
            isSunday(endDate)
          }>
          立即租借
        </button>
        <button
          className="btn btn-outline-primary k-main-radius"
          onClick={handleAddToCart}
          disabled={
            isSunday(startDate) ||
            isSunday(endDate)
          }
        >
          加入購物車
        </button>
      </div>
    </div>
  );
}
