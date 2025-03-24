import React from "react";
import styles from "./ShopAllButton.module.scss";

const ShopAllButton = ({ onClick }) => {
  return (
    <button className={styles.shopAllButton} onClick={onClick}>
      <span className={styles.content}>
        了解更多
        <span className={styles.arrow}>→</span>
      </span>
    </button>
  );
};

export default ShopAllButton;