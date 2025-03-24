'use client';

import React, { useState, useEffect } from 'react';
import AdCard from '../ad-card';
import style from './index.module.scss';

export default function RecommendedProducts({ articleId }) {
  // 初始值設為 undefined 表示請求尚未完成
  const [productId, setProductId] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductId = async () => {
      try {
        const res = await fetch('/api/product/update-product-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId})
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        setProductId(data.productId);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProductId();
  }, [articleId]);

  if (error) {
    return <div className={style['error']}>Error: {error}</div>;
  }
  // 還在 loading 狀態時不顯示
  if (productId === undefined) return null;
  // 當查詢完成但無推薦商品時，整個推薦區塊都隱藏
  if (productId === null) return null;

  return (
    <>
      <div className="mb-4 title">
        <div className={style['y-title-line']} />
        <h3 className="mb-3" style={{ fontSize: 18, fontWeight: 500 }}>
          本文推薦
        </h3>
        <div className={style['y-title-line']} />
      </div>
      <AdCard productId={productId} />
    </>
  );
}