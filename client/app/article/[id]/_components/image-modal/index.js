'use client';

import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';

export default function ImageModal({ imageUrl, onClose }) {
  const [loading, setLoading] = useState(true);
  
  // 添加ESC鍵關閉功能
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {loading && <div className={styles.loader}></div>}
        <img 
          src={imageUrl} 
          alt="圖片預覽" 
          className={styles.modalImage}
          onLoad={handleImageLoad}
        />
        {/* 將關閉按鈕放在圖片同一層級 */}
        <button className={styles.closeButton} onClick={onClose} aria-label="關閉預覽">
          ✕
        </button>
      </div>
    </div>
  );
}