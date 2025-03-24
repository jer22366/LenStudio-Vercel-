'use client';
import { useEffect, useState, useCallback } from "react";
import useAuth from "@/hooks/use-auth";
import Sidenav from "../_components/Sidenav/page";
import FavoriteButton from "../_components/favorite-button-p/page";
import Link from "next/link";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import styles from "./collect.module.scss";
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function CollectPage() {
  const { token, loading } = useAuth();
  const [collections, setCollections] = useState({
    products: [],
    rents: [],
    courses: [],
    articles: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [slidePercentage, setSlidePercentage] = useState(33.33);

  useEffect(() => {
    const updateSlidePercentage = () => {
      setSlidePercentage(window.innerWidth < 768 ? 100 : 33.33);
    };
    updateSlidePercentage();
    window.addEventListener("resize", updateSlidePercentage);
    return () => window.removeEventListener("resize", updateSlidePercentage);
  }, []);

  const fetchFavorites = useCallback(() => {
    if (!token) return;
    setIsLoading(true);

    fetch(`https://lenstudio.onrender.com/api/users/favorites/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setCollections(data);
        } else {
          setCollections({ products: [], rents: [], courses: [], articles: [] });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("獲取收藏失敗:", err);
        setIsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = () => {
    fetchFavorites();
  };

  if (loading || isLoading) {
    return <div className="text-center mt-5">載入中...</div>;
  }

  return (
    <div className="container py-4">
      <div className={`row ${styles.marginTop}`}>
        <Sidenav />
        <div className="col-md-8 col-lg-9 py-4">
          <h1 className={`mb-4 ${styles.h1}`}>我的收藏</h1>
          {/* 產品收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">相機</h5>
            {collections.products.length === 0 ? (
              <p>目前沒有收藏的商品</p>
            ) : (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={3}
                breakpoints={{
                  390: { slidesPerView: 1 },  // 螢幕寬度 ≦ 320px 時顯示 1 張
                  768: { slidesPerView: 2 },  // 螢幕寬度 ≧ 768px 時顯示 2 張
                  1024: { slidesPerView: 3 }, // 螢幕寬度 ≧ 1024px 時顯示 3 張
                }}
                loop={true}
                pagination={{ clickable: true }}
              >
                {collections.products.map((item) => (
                  <SwiperSlide key={item.collect_id || item.product_id}>
                    <Link href={`/product/${item.product_id}`} className={`${styles.noUnderline} ${styles.cardLink}`} >
                      <div className={`p-4 ${styles.collectionCard}`}>
                        <div className='text-end'>
                          <FavoriteButton productId={item.product_id} onFavoriteToggle={handleRefresh} />
                        </div>
                        <img src={item.image_url} alt={item.name} className="mb-3" />
                        <div className={styles.cardDivider} />
                        <h6 className={styles.textGray}>{item.brand_name}</h6>
                        <h5 className="mb-3">{item.name}</h5>
                        <h5 className={`mb-3 ${styles.price}`}>價格: ${item.price}</h5>
                        <h6 className={styles.textGray}>{item.short_introduce}</h6>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>

          {/* 租賃收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">租賃</h5>
            {collections.rents.length === 0 ? (
              <p>沒有收藏的租賃</p>
            ) : (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={3}
                breakpoints={{
                  390: { slidesPerView: 1 },  // 螢幕寬度 ≦ 320px 時顯示 1 張
                  768: { slidesPerView: 2 },  // 螢幕寬度 ≧ 768px 時顯示 2 張
                  1024: { slidesPerView: 3 }, // 螢幕寬度 ≧ 1024px 時顯示 3 張
                }}
                loop={true}
                pagination={{ clickable: true }}
              >
                {collections.rents.map((item) => (
                  <SwiperSlide key={item.collect_id || item.rent_id}>
                    <Link href={`/rental/${item.rent_id}`} className={`${styles.noUnderline} ${styles.cardLink}`} >
                      <div className={`p-4 ${styles.collectionCard}`}>
                        <div className='text-end'>
                          <FavoriteButton rentId={item.rent_id} onFavoriteToggle={handleRefresh} />
                        </div>
                        <img src={item.image_url} alt={item.rent_name} className="mb-3" />
                        <div className={styles.cardDivider} />
                        <h6 className={styles.textGray}>{item.brand}</h6>
                        <h5 className="mb-3">{item.rent_name}</h5>
                        <h5 className={`mb-3 ${styles.price}`}>價格: ${item.price} /天</h5>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>

          {/* 課程收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">課程</h5>
            {collections.courses.length === 0 ? (
              <p>沒有收藏的課程</p>
            ) : (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={3}
                breakpoints={{
                  390: { slidesPerView: 1 },  // 螢幕寬度 ≦ 320px 時顯示 1 張
                  768: { slidesPerView: 2 },  // 螢幕寬度 ≧ 768px 時顯示 2 張
                  1024: { slidesPerView: 3 }, // 螢幕寬度 ≧ 1024px 時顯示 3 張
                }}
                loop={true}
                pagination={{ clickable: true }}
              >
                {collections.courses.map((item) => (
                  <SwiperSlide key={item.collect_id || item.course_id}>
                    <Link href={`/courses/${item.course_id}`} className={`${styles.noUnderline} ${styles.cardLink}`} >
                      <div className={`p-4 ${styles.collectionCard}`}>
                        <div className='text-end'>
                          <FavoriteButton courseId={item.course_id} onFavoriteToggle={handleRefresh} />
                        </div>
                        <img src={item.image_url} alt={item.course_title} className="mb-3" />
                        <div className={styles.cardDivider} />
                        <h6 className={styles.textGray}>講師: {item.instructor_name}</h6>
                        <h5 className={`${styles.courseTitle}`}>{item.course_title}</h5>
                        <h5 className={`mb-3 ${styles.price}`}>價格: ${item.price}</h5>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>

          {/* 文章收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">文章</h5>
            {collections.articles.length === 0 ? (
              <p>沒有收藏的文章</p>
            ) : (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={3}
                breakpoints={{
                  390: { slidesPerView: 1 },  // 螢幕寬度 ≦ 320px 時顯示 1 張
                  768: { slidesPerView: 2 },  // 螢幕寬度 ≧ 768px 時顯示 2 張
                  1024: { slidesPerView: 3 }, // 螢幕寬度 ≧ 1024px 時顯示 3 張
                }}
                loop={true}
                pagination={{ clickable: true }}
              >
                {collections.articles.map((item) => (
                  <SwiperSlide key={item.collect_id || item.article_id}>
                    <Link href={`/article/${item.article_id}`} className={`${styles.noUnderline} ${styles.cardLink}`} >
                      <div className={`p-4 ${styles.collectionCard}`}>
                        <div className='text-end'>
                          <FavoriteButton articleId={item.article_id} onFavoriteToggle={handleRefresh} />
                        </div>
                        <img src={item.image_url} alt={item.title} className="mb-3" />
                        <div className={styles.cardDivider} />
                        <h5>{item.title}</h5>
                        <h6 className={styles.textGray}>{item.subtitle}</h6>
                        <h6 >讚數: {item.like_count}</h6>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};























