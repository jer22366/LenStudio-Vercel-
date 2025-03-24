'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 滑動選單元件
export default function MenuToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const pathname = usePathname()

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 選單項目
  const menuItems = [
    { text: '首頁', path: '/' },
    { text: '產品系列', path: '/product' },
    { text: '租借服務', path: '/rental' },
    { text: '影像學院', path: '/courses' },
    { text: '影像日誌', path: '/article' },
  ]

  // 選單動畫變量
  const sidebarVariants = {
    open: {
      clipPath: `circle(1500px at calc(100% - 40px) 40px)`,
      transition: {
        type: "spring",
        stiffness: 20,
        restDelta: 2,
      },
    },
    closed: {
      clipPath: "circle(30px at calc(100% - 40px) 40px)",
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  }

  const navVariants = {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  }

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  }

  return (
    <div ref={containerRef} className="menu-icon">
      {/* 漢堡按鈕 - 增加 z-index 確保顯示在選單上方 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          outline: "none",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          padding: 0,
          position: isOpen ? "fixed" : "relative", // 保持固定位置
          top: isOpen ? "20px" : "auto", // 固定位置在選單開啟時
          right: isOpen ? "20px" : "auto", // 固定位置在選單開啟時
          zIndex: 1002, // 確保高於選單的 z-index
        }}
      >
        <svg width="23" height="23" viewBox="0 0 23 23">
          <motion.path
            fill="transparent"
            strokeWidth="3"
            stroke={isOpen ? "#143146" : "white"} // 條件判斷顏色
            strokeLinecap="round"
            variants={{
              closed: { d: "M 2 2.5 L 20 2.5" },
              open: { d: "M 3 16.5 L 17 2.5" },
            }}
            animate={isOpen ? "open" : "closed"}
          />
          <motion.path
            fill="transparent"
            strokeWidth="3"
            stroke={isOpen ? "#143146" : "white"} // 修改這裡，同樣使用條件判斷顏色
            strokeLinecap="round"
            d="M 2 9.423 L 20 9.423"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.1 }}
          />
          <motion.path
            fill="transparent"
            strokeWidth="3"
            stroke={isOpen ? "#143146" : "white"} // 修改這裡，同樣使用條件判斷顏色
            strokeLinecap="round"
            variants={{
              closed: { d: "M 2 16.346 L 20 16.346" },
              open: { d: "M 3 2.5 L 17 16.346" },
            }}
            animate={isOpen ? "open" : "closed"}
          />
        </svg>
      </button>

      {/* 側邊滑出選單 */}
      <motion.div
        className="sidebar-menu"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '390px',
          zIndex: 999,
          display: isOpen ? 'block' : 'none'
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: '#eaeaea',
          }}
          variants={sidebarVariants}
        />

        <motion.ul
          variants={navVariants}
          style={{
            position: 'absolute',
            top: 0,
            padding: '80px 25px 25px',
            width: '100%',
            listStyle: 'none',
          }}
        >
          {menuItems.map((item, i) => (
            <motion.li
              key={i}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
              style={{
                cursor: 'pointer',
                margin: '15px 0',
                padding: '10px 0',
                borderBottom: '1px solid #143146',
              }}
              onClick={() => setIsOpen(false)}
            >
              <Link
                href={item.path}
                style={{
                  color: pathname === item.path ? '#ffa510' : '#143146',
                  fontWeight: pathname === item.path ? 'bold' : 'normal',
                  textDecoration: 'none',
                  fontSize: '18px',
                  display: 'block',
                }}
              >
                {item.text}
              </Link>
            </motion.li>
          ))}

          {/* 登入選項加入動畫列表中 */}
          <motion.li
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            style={{
              cursor: 'pointer',
              margin: '15px 0',
              padding: '10px 0',
            }}
          >
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <img src="/images/icon/user-hamburger.svg" alt="登入" style={{ width: '24px', height: '24px' }} />
              <span style={{ marginLeft: '10px', color: '#143146' }}>登入</span>
            </Link>
          </motion.li>
        </motion.ul>

        {/* 移除此區塊，因為已加入上方動畫列表 */}
        {/* <div style={{ padding: '0 25px', marginTop: '20px' }}>
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <img src="/images/icon/user-hamburger.svg" alt="登入" style={{ width: '24px', height: '24px' }} />
          </Link>
        </div> */}
      </motion.div>
    </div>
  )
}