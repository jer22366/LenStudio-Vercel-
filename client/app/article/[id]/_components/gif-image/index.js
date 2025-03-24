import React from 'react';

export default function GifImage({ src, alt, containerSize }) {
  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        backgroundImage: `url(${src})`,
        backgroundSize: 'contain', // 完整呈現圖片內容
        backgroundPosition: 'left center', // 靠左對齊
        backgroundRepeat: 'no-repeat',
      }}
      aria-label={alt}
    />
  );
}