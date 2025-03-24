"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./image-gallery.module.scss";
import CompareButton from "../product-button";

export default function ImageGallery({ productId }) {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const zoomLensRef = useRef(null);
  const mainImageRef = useRef(null);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const response = await fetch(`https://lenstudio.onrender.com/api/product/${productId}`);
        if (!response.ok) throw new Error("無法獲取商品資料");

        const data = await response.json();

        if (data.images && data.images.length > 0) {
          setImages(data.images);
        }

        setProduct(data);
      } catch (error) {
        console.error("圖片載入錯誤:", error);
      }
    }

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const updateMainImage = (index) => {
    setCurrentIndex(index);
  };

  const previousImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // 放大鏡效果
  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return; // ⛔ 手機版不啟用放大鏡

    const zoomLens = zoomLensRef.current;
    const mainImage = mainImageRef.current;
    if (!zoomLens || !mainImage) return;

    const { left, top, width, height } = mainImage.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    if (x < 0 || y < 0 || x > width || y > height) {
      zoomLens.style.display = "none";
      return;
    }

    zoomLens.style.display = "block";
    zoomLens.style.left = `${x - zoomLens.offsetWidth / 2}px`;
    zoomLens.style.top = `${y - zoomLens.offsetHeight / 2}px`;

    const zoomLevel = 2;
    zoomLens.style.backgroundImage = `url(${images[currentIndex]})`;
    zoomLens.style.backgroundSize = `${width * zoomLevel}px ${height * zoomLevel}px`;

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    zoomLens.style.backgroundPosition = `${bgX}% ${bgY}%`;
  };



  const handleMouseLeave = () => {
    if (zoomLensRef.current) {
      zoomLensRef.current.style.display = "none";
    }
  };

  if (images.length === 0) {
    return <p>圖片載入中...</p>;
  }

  return (
    <div className="col-md-6 col-12 d-flex">
      <div className={`flex-column ${styles.thumbnailContainer}`}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            className={styles.thumbnailImg}
            alt={`縮圖 ${index + 1}`}
            onClick={() => updateMainImage(index)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
      <div
        className={styles.mainImageContainer}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          ref={mainImageRef}
          id="mainImage"
          src={images[currentIndex]}
          className={styles.mainImage}
          alt="商品圖片"
        />
        {/* 放大鏡效果 */}
        <div ref={zoomLensRef} className={styles.zoomLens}></div>

        <span className={`${styles.arrow} ${styles.arrowLeft}`} onClick={previousImage}>
          &lt;
        </span>
        <span className={`${styles.arrow} ${styles.arrowRight}`} onClick={nextImage}>
          &gt;
        </span>
        {product && (
          <div className={styles.cameraIconContainer}>
            <CompareButton product={product} />
          </div>
        )}
      </div>
    </div>
  );
}
