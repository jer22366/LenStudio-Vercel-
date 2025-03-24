// components/GoogleLoginButton.js
"use client";
import { useState } from "react";
import { signInWithGoogle, logout } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import styles from "./GoogleLoginButton.module.scss";

export default function GoogleLoginButton() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const userData = await signInWithGoogle();
      setUser(userData);
      router.push("/");
      window.location.reload()
    } catch (error) {
      console.error("登入錯誤", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
        <a onClick={handleLogin} className="me-3 ms-5"><img
        id="avatar"
        src="/images/icon/google.png" // ✅ 使用相對路徑
        alt="google icon"
        className={styles.avatar}
        style={{ cursor: "pointer" }}
      /></a>
  );
}
