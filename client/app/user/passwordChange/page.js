'use client'
import Link from 'next/link'
import styles from './passwordChange.module.scss'
import useAuth from '@/hooks/use-auth';
import Sidenav from '../_components/Sidenav/page'
import React, { useState } from "react";
import { Router } from 'react-bootstrap-icons';
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';




export default function UserPage(props) {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // 錯誤訊息 state

  if (loading) {
    return <div className="text-center mt-5">載入中...</div>;
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("請填寫所有密碼欄位");
      return;
    }


    if (newPassword !== confirmPassword) {
      setErrorMessage("新密碼與確認密碼不一致");
      return;
    }

    setUpdating(true); // 進入「處理中」狀態
    try {
      const response = await fetch(
        `https://lenstudio.onrender.com/api/users/${user.account}`, // 🔹 使用者帳號
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: currentPassword,
            password: newPassword,
          }),
        }
      );

      const result = await response.json();
      console.log("📌 更新密碼 API 回應:", result);

      if (result.status !== 'success') {
        // 設定錯誤訊息，並跳出處理
        setErrorMessage(result.message);
        throw new Error(result.message);
      }

      Swal.fire({
        icon: "success",
        title: "密碼更新成功！",
        confirmButtonText: "確定",
        confirmButtonColor: "#143146",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.push('/user');
    } catch (error) {
      // console.error('❌ 更新密碼失敗:', error);
      // 錯誤訊息已透過 setErrorMessage 設定
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container py-4">
      <div className={`row ${styles.marginTop}`}>
        {/* 側邊選單 */}
        <div className="col-md-3 py-4 row">
          <Sidenav />
        </div>
        {/* 主要內容 */}
        <main className={`col-md-9 py-4`}>
          <div className="mb-4">
            <h1 className={`margin ${styles.h1}`}>更改我的密碼</h1>
          </div>

          <div className={styles.formContainer}>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label className="form-label">目前密碼</label>
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password" className={`form-control ${styles.formControl}`} />
              </div>

              <div className="mb-3">
                <label className="form-label">新密碼</label>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password" className={`form-control ${styles.formControl}`} />
              </div>

              <div className="mb-3">
                <label className="form-label">確認新密碼</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password" className={`form-control ${styles.formControl}`} />
              </div>

              {/* 如果有錯誤訊息，則在按鈕上方顯示 */}
              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}
              <Link href="/user"><button className={styles.btnWhite}>
                返回
              </button></Link>
              <button type="submit" className={styles.btnChange}>
                更改密碼
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}