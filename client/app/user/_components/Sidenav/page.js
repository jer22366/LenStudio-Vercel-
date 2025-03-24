'use client'
import Link from 'next/link'
import styles from './sidenav.module.scss'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { FiMenu, FiUser, FiShoppingCart, FiEdit, FiBox, FiBookOpen, FiHeart, FiGift, FiLogOut } from "react-icons/fi"; //匯入 React Icons

export default function Sidenav() {
  const router = useRouter();
  const appKey = "loginWithToken";
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(appKey);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    const API = "https://lenstudio.onrender.com/api/users/logout";
    if (!token) return;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const result = await res.json();
      if (result.status !== "success") throw new Error(result.message);

      localStorage.clear();
      window.dispatchEvent(new Event('cartUpdated'))
      setToken(null);
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("登出失敗:", err);
      alert(err.message);
    }
  };

  return (
    <div className=" col-xl-3 mb-4">
      {isMobile ? (
        <div className={styles.mobileMenu}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu size={24} />
          </button>
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/user"><FiUser /> 會員資料修改</Link>
              <Link href="/user/order"><FiShoppingCart />  我的訂單</Link>
              <Link href="/user/article"><FiEdit />  我的文章</Link>
              <Link href="/user/rental"><FiBox />  我的租借</Link>
              <Link href="/user/course"><FiBookOpen />  我的課程</Link>
              <Link href="/user/collect"><FiHeart />  我的收藏</Link>
              <Link href="/user/coupon"><FiGift />  優惠券</Link>
              <a href="/login" onClick={handleLogout}><FiLogOut /> 登出</a>
            </div>
          )}
        </div>
      ) : (
        <nav className={`d-flex flex-column ${styles.sidenav}`}>
          <Link href="/user" className={styles.sidenavLink}><FiUser /> 會員資料修改</Link>
          <Link href="/user/order" className={styles.sidenavLink}><FiShoppingCart />  我的訂單</Link>
          <Link href="/user/article" className={styles.sidenavLink}><FiEdit />  我的文章</Link>
          <Link href="/user/rental" className={styles.sidenavLink}><FiBox />  我的租借</Link>
          <Link href="/user/course" className={styles.sidenavLink}><FiBookOpen />  我的課程</Link>
          <Link href="/user/collect" className={styles.sidenavLink}><FiHeart />  我的收藏</Link>
          <Link href="/user/coupon" className={styles.sidenavLink}><FiGift />  優惠券</Link>
          <a href="/login" className={styles.sidenavLink} onClick={handleLogout}><FiLogOut /> 登出</a>
        </nav>
      )}
    </div>
  );
}
