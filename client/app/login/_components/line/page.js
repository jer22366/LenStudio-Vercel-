"use client"
import React from "react";
import Image from "next/image";
import styles from "./line.module.scss";

const LineLoginButton = () => {
  const LINE_CLIENT_ID = "2007047585"; // 請填寫你的 LINE Channel ID
  const REDIRECT_URI = "http://localhost:3000/login/callback"; // 你的回調 URL
  const STATE = Math.random().toString(36).substring(7); // 防止 CSRF 攻擊
  const SCOPE = "profile openid email";
  const NONCE = Math.random().toString(36).substring(7); // 防止重放攻擊

  const loginWithLine = () => {
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}&scope=${SCOPE}&nonce=${NONCE}`;
    
    window.location.href = lineAuthUrl;
  };

  return (
      <a onClick={loginWithLine} style={{ cursor: "pointer" }} className={styles.margin}>
        <Image
          src="/images/icon/line.png" // ✅ 使用 next/image 確保最佳效能
          alt="LINE Login"
          width={40} // ✅ 設定適當的尺寸
          height={40}
          className={styles.avatar}
        />
      </a>
  );
};

export default LineLoginButton;
