'use client'
import Link from 'next/link'
import styles from './register.module.scss'
import React, { useState } from 'react'
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { MdEdit } from 'react-icons/md'

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gender: '',
    firstName: '',
    nickName: '',
    password: '',
    confirmPassword: '',
    email: '',
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState('/uploads/users.webp'); // 預設大頭貼
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ 處理輸入變更
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ 處理圖片選擇 & 預覽
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file }); // 儲存檔案
      setAvatarPreview(URL.createObjectURL(file)); // 預覽圖片
    }
  };

  // ✅ 提交表單
  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('❌ 密碼與確認密碼不一致！');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('account', formData.email);
      formDataToSend.append('name', formData.firstName);
      formDataToSend.append('nickname', formData.nickName);
      formDataToSend.append('mail', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('gender', formData.gender);

      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await fetch('https://lenstudio.onrender.com/api/users', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccessMessage('✅ 帳戶創建成功！請登入');
        setError('');

        await new Promise((resolve) => {
          setFormData({
            gender: '',
            firstName: '',
            nickName: '',
            password: '',
            confirmPassword: '',
            email: '',
            avatar: null,
          });
          setAvatarPreview('/uploads/users.webp');
          Swal.fire({
            icon: "success",
            title: "帳號註冊成功！",
            text: "請登入",
            confirmButtonText: "確定",
          });
          resolve();
        });

        router.push('/login');
      } else {
        setError(`❌ ${result.message}`);
      }
    } catch (err) {
      setError('❌ 註冊失敗，請稍後再試！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.container1}`}>
      <div className={styles.formBox}>
        <h2 className="text-center">建立帳戶</h2>
        <p className="text-center mb-4">
          映相坊邀請您進入非凡世界，提供豐富的作品、文章資訊和服務。
        </p>

        <form onSubmit={handleRegister} className='mb-4'>
          {/* ✅ 點擊頭像上傳 */}
          <div className="mb-3 text-center">
            <div
              className="avatar-container mb-3 d-flex justify-content-center"
              onClick={() => document.getElementById("fileInput").click()}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.width1} >
                <img
                  id="avatar"
                  src={avatarPreview}
                  alt="大頭貼"
                  className={`${styles.avatar} rounded-circle border border-gray-300`}
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
                <label htmlFor="fileInput" className={styles.mdEdit}><MdEdit /></label>
              </div>
            </div>

            <input
              type="file"
              id="fileInput"
              accept="image/*"
              className="d-none"
              onChange={handleFileChange}
            />
          </div>

          {/* 其他表單欄位 */}
          <div className="mb-3">
            <label className={styles.formLabel}>稱謂 *</label>
            <select
              name="gender"
              className={`form-control ${styles.formControl}`}
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="" disabled>請選擇</option>
              <option value="先生">先生</option>
              <option value="女士">女士</option>
            </select>
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>姓名 *</label>
            <input
              type="text"
              className={`form-control ${styles.formControl}`}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>暱稱 *</label>
            <input
              type="text"
              className={`form-control ${styles.formControl}`}
              name="nickName"
              value={formData.nickName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>電子郵件 *</label>
            <input
              type="email"
              className={`form-control ${styles.formControl}`}
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>密碼 *</label>
            <input
              type="password"
              className={`form-control ${styles.formControl}`}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>確認您的密碼 *</label>
            <input
              type="password"
              className={`form-control ${styles.formControl}`}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.btnCustom} disabled={loading}>
            {loading ? '註冊中...' : '建立帳戶'}
          </button>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="text-center mt-3">
          <Link href="/login">我已擁有帳戶</Link>
        </div>
      </div>
    </div>
  )
}
