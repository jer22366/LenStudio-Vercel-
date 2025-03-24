'use client'

import { Noto_Sans_TC, Inter } from 'next/font/google'
import '@/styles/ck-custom.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Footer from './footer'
import Header from './header'
import TeacherFooter from './teacher/_component/teacher-footer/page'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppProvider from '@/hooks/app-provider'
import { CompareProvider } from '@/app/product/_context/CompareContext'
import { IoIosArrowUp } from 'react-icons/io'
import dynamic from "next/dynamic";
import { SocketProvider } from './_components/chat/context/socketContext';
import ScrollTopButton from "@/app/_components/top-btn/page.js"
import CustomHead from '@/app/head'

const Loading = dynamic(() => import("@/app/_components/loading/page.js"), { ssr: false });

const notoSansTC = Noto_Sans_TC({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
})
const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})


export default function RootLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname() || "";
  const [isLoading, setIsLoading] = useState(true);

  // 創建一個默認用戶，實際應用中應從認證系統獲取
  const defaultUser = {
    id: 'default-user',
    name: '訪客用戶',
    token: 'default-token'
  };

  const isTeacherPage = useMemo(
    () => pathname && pathname.startsWith('/teacher'),
    [pathname]
  );

  const isCartPage = useMemo(() => pathname?.startsWith('/cart'), [pathname])
  // top按鈕
  const [showButton, setShowButton] = useState(false)



  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isMobile = window.innerWidth < 1200; // 1200以下不顯示

      if (isMobile) {
        setShowButton(false); // 手機版直接隱藏按鈕
        return;
      }

      // 滾動超過 300px 顯示按鈕
      if (scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }

      // 滾到底部 50px 內隱藏按鈕
      if (scrollY + windowHeight >= documentHeight - 50) {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // 頁面載入時也檢查一次
    handleScroll();


    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // 老師頁面不用layout
  const isExcluded = useMemo(() => pathname.startsWith('/teacher'), [pathname]);

  //loading
  useEffect(() => {
    setIsLoading(true); //pathname 變化時 顯示 Loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]); // 每次網址變化時，重新執行


  return (
    <html lang="zh-TW" className={`${notoSansTC.className} ${inter.className}`}>
      <body>
      <CustomHead />
        {isExcluded ? (
          <main>{isLoading ? <Loading /> : children}</main>
        ) : (

          <div className={isCartPage ? "layout-cart-container" : "layout-container"}>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={true}
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
              className="custom-toast-container"
              style={{ marginTop: "80px" }}
            />
            <CompareProvider>
              {!isTeacherPage && (
                <Header searchOpen={searchOpen} setSearchOpen={setSearchOpen} isCartPage={isCartPage} />
              )}

              {/* 確保 AppProvider 包住 main，但 Loading 只影響內容 */}
              <AppProvider>
                <SocketProvider user={defaultUser} isAdmin={false}>
                  <main className={isExcluded ? "" : "root-content"}>
                    {isLoading ? <Loading /> : children}
                  </main>
                </SocketProvider>
              </AppProvider>

              {isTeacherPage ? <TeacherFooter /> : <Footer isCartPage={isCartPage} />}
            </CompareProvider>
          </div>
        )}
        < ScrollTopButton />
      </body>
    </html>
  )
}