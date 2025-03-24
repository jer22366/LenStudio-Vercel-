'use client'
import Link from 'next/link'
import styles from './user.module.scss'
import React, { useState, useEffect } from 'react'
import useAuth from '@/hooks/use-auth'
import Sidenav from './_components/Sidenav/page'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MdEdit, MdDelete } from "react-icons/md";
import { renderToString } from "react-dom/server";
import Address from './_components/address/page'


export default function UserPage(props) {
  const { token, user = {}, loading, setUser, setToken } = useAuth()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [password, setPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const MySwal = withReactContent(Swal);
  const [addresses, setAddresses] = useState([]); // 存所有住址
  const [latestAddress, setLatestAddress] = useState(''); // 記錄資料庫中的最新地址
  const [previewImage, setPreviewImage] = useState(user.head || "/uploads/users.webp"); // 預覽圖片




  useEffect(() => {
    console.log(" useEffect 內 user:", user); // ✅ 檢查 user 內容

    if (user && Object.keys(user).length > 0) {
      setName(user.name || '');
      setNickname(user.nickname || '');

      let birthdayFormatted = "";
      if (user.birthday) {
        console.log(" 原始 user.birthday:", user.birthday, "類型:", typeof user.birthday);

        if (typeof user.birthday === "string") {
          // 可能是 "2025-02-04T16:00:00.000Z" 或 "2025-02-04"
          birthdayFormatted = user.birthday.includes("T")
            ? user.birthday.split("T")[0]
            : user.birthday;
        } else if (user.birthday instanceof Date) {
          // 可能是 Date 物件
          birthdayFormatted = user.birthday.toISOString().split("T")[0];
        } else {
          // 嘗試轉換為 Date
          try {
            birthdayFormatted = new Date(user.birthday).toISOString().split("T")[0];
          } catch (error) {
            console.error("❌ 無法解析 birthday:", user.birthday, error);
            birthdayFormatted = "";
          }
        }
      }

      console.log(" 格式化後的 birthday:", birthdayFormatted);
      setBirthday(birthdayFormatted);
    }
  }, [user]); //  當 `user` 變更時，`name` 和 `birthday` 才會更新


  // **初始載入時獲取資料**
  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);


  if (loading) {
    return <div className="text-center mt-5">載入中...</div>
  }

  const fetchUserData = async () => {
    try {
      const response = await fetch(`https://lenstudio.onrender.com/api/users/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message);

      console.log("📌 取得的 user 資料:", result.data);

      // 🔥 **步驟 1：如果後端有提供新 Token，就更新**
      if (result.token) {
        console.log(" 從 API 取得新 Token:", result.token);
        localStorage.setItem("loginWithToken", result.token);
        setToken(result.token);
      }

      // 🔥 **步驟 2：更新使用者資訊**
      setUser(prevUser => ({
        ...prevUser,
        ...result.data,
        birthday: result.data.birthday
          ? result.data.birthday.split("T")[0]  // 確保 `YYYY-MM-DD`
          : ''
      }));
    } catch (error) {
      console.error('❌ 取得最新資料失敗:', error);
    }
  };


  //上傳圖片函式
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 先顯示預覽圖片
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("account", user.account);

    try {
      const response = await fetch("https://lenstudio.onrender.com/api/users/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message);


      // 更新 `user.head`，讓前端立即顯示新頭像
      setUser({ ...user, head: result.imageUrl });

      // 移除預覽的本地 URL，避免內存洩漏
      URL.revokeObjectURL(imageUrl);
      if (result.token) {
        console.log("✅ 從 API 取得新 Token:", result.token);

        //更新 localStorage & useAuth 狀態
        localStorage.setItem("loginWithToken", result.token);
        setToken(result.token);
      }

      // 重新獲取使用者資訊**
      await fetchUserData();

    } catch (error) {
      console.error("圖片上傳失敗:", error);
      alert("圖片上傳失敗，請稍後再試");
      setPreviewImage(user.head); // 上傳失敗時，還原回原本的圖片
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch(
        `https://lenstudio.onrender.com/api/users/${user.account}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            nickname,
            password: password || undefined,
            birthday: birthday
              ? (typeof birthday === "string"
                ? birthday.split("T")[0]
                : new Date(birthday).toISOString().split("T")[0])
              : '',
            head: user.head,
          }),
        }
      );

      const result = await response.json();
      console.log(" 更新 API 回應:", result);

      if (result.status !== 'success') throw new Error(result.message);

      // 更新成功，使用 Swal 彈出成功訊息
      Swal.fire({
        icon: "success",
        title: "更新成功！",
        text: result.message, // 從 API 回應顯示成功訊息
        confirmButtonText: "確定",
        confirmButtonColor: "#143146",
      });

      // 檢查後端是否提供新的 Token
      if (result.token) {
        console.log("✅ 從 API 取得新 Token:", result.token);

        // 更新 localStorage & useAuth 狀態
        localStorage.setItem("loginWithToken", result.token);
        setToken(result.token);
      }

      // 重新獲取使用者資訊
      await fetchUserData();

      // 導向 `/user` 頁面
      // window.location.href = "/user";
    } catch (error) {
      //更新失敗，使用 Swal 彈出錯誤訊息 
      Swal.fire({
        icon: "error",
        title: "更新失敗",
        text: error.message || "請稍後再試",
        confirmButtonText: "確定",
        confirmButtonColor: "#143146",
      });
    } finally {
      setUpdating(false);
    }
  };

  //address

  // **函式: 獲取最新的住址**
  // **獲取所有住址**
  const fetchAddresses = async () => {
    if (!token) {
      Swal.fire('錯誤', '請先登入', 'error');
      return;
    }

    try {
      const response = await fetch('https://lenstudio.onrender.com/api/users/addresses/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setAddresses(result.data); // ✅ 更新地址清單
      } else {
        setAddresses([]); // ✅ 沒有住址，設為空陣列
      }
    } catch (error) {
      console.error("❌ 獲取住址失敗:", error);
      setAddresses([]);
    }
  };






  const AddressList = () => {
    const [addresses, setAddresses] = React.useState([]);

    // 初始取得地址列表
    React.useEffect(() => {
      const fetchAddresses = async () => {
        const response = await fetch('https://lenstudio.onrender.com/api/users/addresses');
        const result = await response.json();
        if (result.status === 'success') {
          setAddresses(result.data);
        }
      };

      fetchAddresses();
    }, []);
  }

  return (
    <div>
      <div className={`container py-4`}>
        <div className={`row ${styles.marginTop}`}>
          <div className="col-md-3 py-4 row">
            <Sidenav />
          </div>
          {/* 主要內容區 */}
          <div className="col-md-9 py-4">
            <div className="mb-4">
              <h1 className={styles.h1}>會員資料修改</h1>
              <p className="text-muted">
                在此部分中，您可以尋找和編輯您的個人檔案和地址。您還可以管理您的相機電子報訂閱和更改密碼。
              </p>
            </div>

            {/* 橫幅區域 */}
            <div
              className={`${styles.heroSection} mb-4 p-4 d-flex flex-column justify-content-center`}
            >
              <h6 className="text-black ms-3">獲取相機最新消息</h6>
              <Link href="/article"><button className={styles.customBtn}>立即前往</button></Link>
            </div>

            {/* 表單區域 */}
            <div className="row">
              {/* 個人資料表單 */}
              <div className="col-lg-7 mb-4">
                <div className={styles.customCard}>
                  <form onSubmit={handleUpdate}>
                    <div className="d-flex flex-column align-items-center ">
                      <div className="avatar-container mb-3" onClick={() => document.getElementById("fileInput").click()} style={{ cursor: "pointer" }}>
                        <div className={styles.width1} >
                          <img
                            id="avatar"
                            src={user.head ? user.head : "/uploads/users.webp"} // ✅ 使用相對路徑
                            alt="大頭貼"
                            className="rounded-circle border border-gray-300"
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                          />
                          <label htmlFor="fileInput" className={styles.mdEdit}><MdEdit /></label>
                        </div>
                      </div>
                      <div className="mb-3 ">
                        <input
                          type="file"
                          id="fileInput"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />

                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">電子郵件</label>
                      <input
                        type="email"
                        className={`form-control ${styles.customInput}`}
                        disabled
                        value={user?.account || ''}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">姓名 *</label>
                      <input
                        type="text"
                        className={`form-control ${styles.customInput}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">暱稱 *</label>
                      <input
                        type="text"
                        className={`form-control ${styles.customInput}`}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">出生日期</label>
                      <input
                        type="date"
                        className={`form-control ${styles.customInput}`}
                        max={new Date().toISOString().split("T")[0]}
                        value={birthday || ""} // ✅ `YYYY-MM-DD` 格式
                        onChange={(e) => setBirthday(e.target.value)} // ✅ 確保不會帶時間
                      />
                    </div>
                    <button
                      type="submit"
                      className={styles.customBtn}
                      disabled={updating}
                    >
                      更新我的帳戶
                    </button>
                  </form>
                </div>
              </div>

              {/* 密碼修改區 */}
              <div className="col-lg-5 mb-4">
                <div className={styles.customCard}>
                  <h5>我的密碼</h5>
                  <p className="mt-4 text-muted">
                    如要更改密碼，您需要先輸入目前的密碼。
                  </p>
                  <Link href="/user/passwordChange">
                    <button className={`mt-4 ${styles.customBtn}`}>
                      更新我的密碼
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 地址區域 */}
            <div className={`${styles.customCard} mt-4`}>

              <div>
                <Address />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


//<ul>
// {addresses.map((address) => (
//   <li key={address.id}>
//     {address.address}
//     <button onClick={() => handleEditAddress(address.id, address.address)}>編輯</button>
//     <button onClick={() => handleDeleteAddress(address.id)}>刪除</button>
//   </li>
// ))}
// </ul>