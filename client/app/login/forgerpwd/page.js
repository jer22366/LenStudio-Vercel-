'use client';
import React, { useState } from 'react';
import Link from "next/link";
import axios from 'axios';
import styles from "./forgot.module.scss";
import Swal from 'sweetalert2';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await axios.post('https://lenstudio.onrender.com/api/forgot/send-otp', { email });
      setStep(2);
      Swal.fire('成功！', 'OTP 驗證碼已發送至您的電子郵件', 'success');
    } catch (error) {
      console.error('OTP 發送失敗', error);
      Swal.fire('錯誤！', 'OTP 發送失敗，請稍後再試', 'error');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://lenstudio.onrender.com/api/forgot/verify-otp', {
        email,
        otp
      });

      if (response.data.success) {
        setOtpVerified(true);
        setStep(3);
        Swal.fire('成功！', 'OTP 驗證成功，請輸入新密碼', 'success');
      }
    } catch (error) {
      console.error('OTP 驗證失敗', error);
      Swal.fire('錯誤！', 'OTP 驗證失敗，請確認輸入的 OTP 是否正確', 'error');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire('錯誤！', '新密碼與確認密碼不一致！', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://lenstudio.onrender.com/api/forgot/reset-password', {
        account: email,
        newPassword
      });
      Swal.fire('成功！', '密碼重設成功！請重新登入', 'success');
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpVerified(false);
    } catch (error) {
      console.error('密碼重設失敗', error);
      Swal.fire('錯誤！', '密碼重設失敗，請稍後再試', 'error');
    }
    setLoading(false);
  };

  return (
    <div className={`container ${styles.container1}`}>
      <div className={styles.formBox}>
        <h2 className="text-center mb-4">忘記您的密碼？</h2>
        <p className="text-center mb-4" style={{ fontSize: "15px" }}>
          請輸入您的電郵地址，系統會發送 OTP 驗證碼，<br />輸入後即可重設您的密碼。
        </p>

        {step === 1 && (
          <div className="mb-3">
            <label className={styles.formLabel}>輸入您的帳戶 Email *</label>
            <div className="mb-3 d-flex">
              <input
                type="email"
                className={`form-control ${styles.formControl1}`}
                placeholder="輸入 Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button onClick={handleSendOTP} className={styles.btnCustom1} disabled={loading}>
                {loading ? "發送中..." : "發送 OTP"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mb-3">
            <label className={styles.formLabel}>輸入 OTP 碼 *</label>
            <input
              type="text"
              className={`form-control mb-3 ${styles.formControl1}`}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button onClick={handleVerifyOTP} className={styles.btnCustom1} disabled={loading || otpVerified}>
              {otpVerified ? "已驗證" : "驗證 OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className={styles.formLabel}>新密碼 *</label>
              <input
                type="password"
                className={`form-control ${styles.formControl}`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className={styles.formLabel}>確認您的新密碼 *</label>
              <input
                type="password"
                className={`form-control ${styles.formControl}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.btnCustom} disabled={loading}>
              {loading ? "確認中..." : "送出"}
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          <Link href="/login">回到登入頁面</Link>
        </div>
      </div>
    </div>
  );
}