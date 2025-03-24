'use client';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { RiCoupon2Fill } from 'react-icons/ri';
import './coupon-icon.scss';
import { jwtDecode } from 'jwt-decode';

const CouponButton = () => {
  const showCouponAlert = async () => {
    const token = localStorage.getItem('loginWithToken');

    if (!token) {
      Swal.fire({
        title: '錯誤',
        text: '您尚未登入，請先登入！',
        icon: 'error',
        confirmButtonText: '確定',
        allowOutsideClick: true,
      });
      return;
    }

    let userId;
    try {
      userId = jwtDecode(token).id;
    } catch (error) {
      Swal.fire({
        title: '錯誤',
        text: '無效的登入狀態，請重新登入。',
        icon: 'error',
        confirmButtonText: '確定',
        allowOutsideClick: true,
      });
      return;
    }

    try {
      // **1. 檢查兩種優惠券是否已達領取上限**
      const checkCoupons = await Promise.all([
        fetch('https://lenstudio.onrender.com/api/getCp/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, couponId: 1 }),
        }),
        fetch('https://lenstudio.onrender.com/api/getCp/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, couponId: 2 }),
        })
      ]);

      const [checkCoupon1, checkCoupon2] = await Promise.all(checkCoupons.map(res => res.json()));

      let couponsToClaim = [];
      if (!checkCoupon1.reachedLimit) couponsToClaim.push(1);
      if (!checkCoupon2.reachedLimit) couponsToClaim.push(2);

      // 如果兩種優惠券都達到上限，則不允許領取
      if (couponsToClaim.length === 0) {
        Swal.fire({
          title: '提示',
          text: '您已領取所有優惠券，無法再領取！',
          icon: 'info',
          confirmButtonText: '確定',
          allowOutsideClick: true,
        });
        return;
      }

      // **2. 領取所有未達上限的優惠券**
      const claimRequests = couponsToClaim.map(couponId =>
        fetch('https://lenstudio.onrender.com/api/getCp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, quantity: 1, couponId }),
        })
      );

      const claimResults = await Promise.all(claimRequests);
      const claimResponses = await Promise.all(claimResults.map(res => res.json()));

      // **3. 根據領取結果顯示提示**
      const successCoupons = claimResponses.filter(res => res.success);
      if (successCoupons.length > 0) {
        Swal.fire({
          title: '成功',
          text: `已領取新會員優惠券！`,
          icon: 'success',
          confirmButtonText: '確定',
          allowOutsideClick: true,
        });
      } else {
        Swal.fire({
          title: '錯誤',
          text: '領取優惠券失敗，請稍後再試。',
          icon: 'error',
          confirmButtonText: '確定',
          allowOutsideClick: true,
        });
      }
    } catch (error) {
      console.error('發生錯誤:', error);
      Swal.fire({
        title: '錯誤',
        text: '系統錯誤，請稍後再試。',
        icon: 'error',
        confirmButtonText: '確定',
        allowOutsideClick: true,
      });
    }
  };

  return (
    <button onClick={showCouponAlert} className="coupon-button">
      <RiCoupon2Fill size={25} />
    </button>
  );
};

export default CouponButton;
