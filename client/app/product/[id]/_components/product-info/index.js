"use client";
import {useState} from "react";
import styles from "./product-info.module.scss";
import CartButton from "../cart-button";
import FavoriteButton from "../favorite-button/page";


export default function ProductInfo({ product }) {

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };
  return (
    <div className={`${styles.productInfo}`}>
      <p className={styles.brand}>{product.brand_name}</p>
      <h1 className={styles.productTitle}>{product.name}</h1>
      <p className={styles.introduce}>{product.short_introduce}</p><br />
      <p className={styles.price}>NT$ {product.price.toLocaleString()}</p>

      {/* 按鈕區域 */}
      <div className="d-flex">
        <CartButton product={product} />
        <FavoriteButton productId={product.id} />
      </div>
    </div>
  );
}
