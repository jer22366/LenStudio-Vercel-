"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Callback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); //增加 `loading` 狀態

  useEffect(() => {
    const fetchTokenAndSaveUser = async () => {
      const code = searchParams.get("code");
      if (!code) return;

      try {
        // console.log("LINE 授權碼:", code);

        // 1️⃣ 先發送 `code` 到後端，讓後端換取 `access_token`
        const backendResponse = await axios.post("https://lenstudio.onrender.com/api/auth/line", {
          code,
        });

        // console.log("後端回應:", backendResponse.data);
        const { token, user } = backendResponse.data.data;

        // 2️⃣ 儲存 Token
        localStorage.setItem("loginWithToken", token);

        // 3️⃣ 設定用戶資料
        setUserData(user);

        // 4️⃣ 導向用戶頁面
        router.push("/user");
      } catch (error) {
        console.error("登入失敗", error);
      } finally {
        setLoading(false); // API 請求完成後才結束 `loading`
      }
    };

    fetchTokenAndSaveUser();

  }, [searchParams]);

  return (
    <div className="container">
      {loading ? (
        <p>正在登入中...</p> // 在 `loading` 期間顯示「正在登入」
      ) : userData ? (
        <div>
          <p>名稱: {userData.name}</p>
        </div>
      ) : (
        <p>登入失敗，請重新嘗試</p>
      )}
    </div>
  );
}
