"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./related-products.module.scss";

export default function RelatedProducts({ brandId, currentId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!brandId || !currentId) return;

    fetch(`https://lenstudio.onrender.com/api/product/related/${brandId}/${currentId}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("錯誤:", error));
  }, [brandId, currentId]);

  return (
    <div className="mb-5 mt-5">
      <h3 className="mb-4">探索系列</h3>
      <hr />

      {products.length > 0 ? (
        <>
          {/* 手機版 Swiper */}
          <div className="d-md-none">
            <Swiper modules={[Pagination]} spaceBetween={20} slidesPerView={2} pagination={{ clickable: true }}>
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link href={`/product/${product.id}`} passHref className={styles.productCard}>
                    <div className="card">
                      <img src={product.image} className={styles.cardimgTop} alt={product.name} />

                      <div className="card-body text-center">
                        <h5 className={styles.cardTitle}>{product.name}</h5>
                        <p className={styles.cardText}>NT$ {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 桌機版 Swiper */}
          <div className="d-none d-md-block">
            <Swiper modules={[Pagination]} spaceBetween={20} slidesPerView={4} pagination={{ clickable: true }}>
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link href={`/product/${product.id}`} passHref className={styles.productCard}>
                    <div className="card">
                      <img src={product.image} className={`${styles.cardimgTop}`} alt={product.name} />
                      <div className="card-body text-center">
                        <h5 className={styles.cardTitle}>{product.name}</h5>
                        <p className={styles.cardText}>NT$ {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      ) : (
        <p className="text-muted text-center">沒有其他相關產品</p>
      )}
    </div>
  );
}
