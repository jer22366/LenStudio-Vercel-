'use client';

import React, { useState } from 'react';
import GifImage from '../gif-image';
import ImageModal from '../image-modal';
import styles from './index.module.scss';

export default function MediaRenderer({ media_type, media_url, isNested = false }) {
  const [showModal, setShowModal] = useState(false);

  if (media_type === 'image') {
    return (
      <>
        <div className={`${styles['y-reply-img']} ${isNested ? styles['nested-media-container'] : ''}`}>
          <img
            src={`/images/article_com_media/${media_url}`}
            alt="Reply attachment"
            className={`${styles['image-attachment']} ${isNested ? styles['nested-image'] : ''}`}
            onClick={() => setShowModal(true)}
          />
        </div>
        {showModal && (
          <ImageModal
            imageUrl={`/images/article_com_media/${media_url}`}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  if (media_type === 'video') {
    return (
      <div className={`${styles['y-reply-img']} ${isNested ? styles['nested-media-container'] : ''}`}>
        <video
          src={`/images/article_com_media/${media_url}`}
          controls
          className={`${styles['video-attachment']} ${isNested ? styles['nested-video'] : ''}`}
        />
      </div>
    );
  }

  if (media_type === 'gif') {
    return (
      <div className={`${styles['y-reply-img']} ${styles['gif-container']} ${isNested ? styles['nested-media-container'] : ''}`}>
        <GifImage
          src={media_url.startsWith('http') ? media_url : `/images/article_com_media/${media_url}`}
          alt="GIF attachment"
          containerSize={isNested ? "100%" : "100%"}
        />
      </div>
    );
  }

  return null;
}