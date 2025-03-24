'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentLoader from 'react-content-loader';
import style from './index.module.scss';

const AdCardLoader = () => {
  return (
    <div className={`mb-3 ${style['y-ad-card']}`}>
      <ContentLoader
        speed={2}
        width={300}
        height={350}
        viewBox="0 0 300 350"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="10" y="0" rx="5" ry="5" width="280" height="200" />
        <rect x="10" y="215" rx="4" ry="4" width="180" height="20" />
        <rect x="10" y="245" rx="3" ry="3" width="130" height="15" />
        <rect x="5" y="305" rx="5" ry="5" width="290" height="40" />
      </ContentLoader>
    </div>
  );
};

export default function AdCard({ productId }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [isDelayDone, setIsDelayDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 設定至少 1500 毫秒的渲染延遲
    const timer = setTimeout(() => {
      setIsDelayDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${productId}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  if (error) return <div className={style.error}>Error: {error}</div>;
  if (!product || !isDelayDone) return <AdCardLoader />;

  return (
    <div className={`mb-3 ${style['y-ad-card']}`}>
      <img src={product.image_url} alt={product.name} />
      <div className={style['product-info']}>
        <h3 className={style['product-title']}>{product.name}</h3>
        <p className={style['product-price']}>NT${product.price}</p>
      </div>
      <button
        className={style['buy-button']}
        onClick={() => router.push(`/product/${product.id}`)}
      >
        BUY
      </button>
    </div>
  );
}