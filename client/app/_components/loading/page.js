"use client"; // 確保這個 component 只會在 client-side 渲染

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/animations/loading-2.json"; // 確保路徑正確

const Loading = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // 只在 client-side 設定
  }, []);

  if (!isClient) return null; // 如果還沒切換到 client-side，就不渲染

  return (
    <div style={styles.loadingContainer}>
      <Lottie animationData={loadingAnimation} style={{ width: 200, height: 200 }} />
    </div>
  );
};

const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // 半透明白色背景
  },
};

export default Loading;
