'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiMenu, FiUser, FiShoppingCart, FiEdit, FiBox, FiBookOpen, FiHeart, FiGift, FiLogOut } from "react-icons/fi";
import Swal from 'sweetalert2';
import styles from './user.module.scss';
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeTimeoutRef = useRef(null); // 用來存 `setTimeout`

  const router = useRouter();

  // 讀取 `localStorage` 並解析 JWT
  const fetchUserData = () => {
    const token = localStorage.getItem('loginWithToken');

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log(decoded);

      // Check if the token is expired
      const expirationTime = decoded.exp * 1000;
      if (Date.now() > expirationTime) {
        console.error('Token 已過期');
        setUser(null);
        return;
      }

      setUser({
        id: decoded.id,
        account: decoded.account,
        name: decoded.name,
        nickname: decoded.nickname,
        email: decoded.mail || "",
        avatar: decoded.head,
      });
    } catch (error) {
      console.error('無法解析 Token:', error);
      setUser(null);
    }
  };

  // 頁面載入時，檢查是否有登入
  useEffect(() => {
    fetchUserData();
  }, []);

  // 監聽 `localStorage` 變化，確保 `user` 狀態即時更新
  useEffect(() => {
    const handleStorageChange = () => {
      fetchUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 滑鼠移入時打開選單
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current); // 停止關閉選單
    }
    setMenuOpen(true);
  };

  // 滑鼠移出時延遲關閉選單
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 300); // 延遲 500ms
  };

  // 登出功能
  const handleLogout = () => {
    Swal.fire({
      title: "確定要登出嗎？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#143146",
      cancelButtonColor: "#d0b088",
      confirmButtonText: "確認登出",
      cancelButtonText: "取消"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear()
        window.dispatchEvent(new Event('cartUpdated'))
        setUser(null);
        Swal.fire({
          title: "登出成功！",
          text: "您已成功登出。",
          icon: "success",
          confirmButtonText: "確定",
          confirmButtonColor: "#143146",
        });
        router.push("/");
      }
    });
  };

  return (
    <div className={styles.container}>
      {/* 使用者選單 (滑鼠懸停觸發) */}
      <div
        className={styles.userMenu}
        ref={menuRef}
        onMouseEnter={handleMouseEnter}  // 滑鼠移入打開選單
        onMouseLeave={handleMouseLeave}  // 滑鼠移出時延遲關閉選單
      >


        <Link href="/user">
          <Image src={"/images/icon/user.svg"} alt="User Icon" width={24} height={24} />
        </Link>

        {/* 下拉選單 */}
        {menuOpen && (
          <div className={styles.dropdownMenu}>
            {/* 會員資訊 */}
            {user ? (
              <div className={styles.profile}>
                <Image src={user.avatar || "/uploads/users.webp"} alt="User Avatar" width={50} height={50} className={styles.avatar} />
                <div>
                  <p className={styles.userName}>{user.name || user.nickname}</p>
                  <p className={styles.userEmail}>{user.account || "line 登入"}</p>
                </div>
              </div>
            ) : (
              <div className={styles.profile}>
                <Image src="/uploads/users.webp" alt="User Avatar" width={50} height={50} className={styles.avatar} />
                <div>
                  <p className={styles.userName}>訪客</p>
                  <p className={styles.userEmail}>未登入</p>
                </div>
              </div>
            )}

            {/* 選單項目 */}
            {user ? (
              <>
                <Link href="/user/" className={styles.menuItem}>會員資料修改</Link>
                <Link href="/user/order" className={styles.menuItem}>我的訂單</Link>
                <Link href="/user/article" className={styles.menuItem}>我的文章</Link>
                <Link href="/user/rental" className={styles.menuItem}>我的租借</Link>
                <Link href="/user/course" className={styles.menuItem}>我的課程</Link>
                <Link href="/user/collect" className={styles.menuItem}>我的收藏</Link>
                <Link href="/user/coupon" className={styles.menuItem}>優惠券</Link>
                <button className={styles.logout} onClick={handleLogout}>
                  <FiLogOut />
                  登出
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.menuItem}>登入</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
