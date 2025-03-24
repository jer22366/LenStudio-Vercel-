import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function useAuth() {
  const router = useRouter();
  const pathname = usePathname(); // 獲取當前頁面路徑
  const appKey = "loginWithToken";

  const [token, setToken] = useState(null);
  const [user, setUser] = useState({ name: "", nickname: "", birthday: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(appKey);

    if (!savedToken) {
      if (pathname !== "/") {
        router.push("/login"); // 不是首頁才跳轉到登入頁
      }
      setLoading(false);
      return;
    }

    try {
      const decodedUser = jwtDecode(savedToken);
      setToken(savedToken);
      setUser(decodedUser || {});
    } catch (error) {
      console.error("Token 解碼失敗", error);
      localStorage.removeItem(appKey);
      if (pathname !== "/") {
        router.push("/login"); // 不是首頁才跳轉
      }
    }

    setLoading(false);
  }, [pathname]); // 當路徑變更時重新檢查

  const userLevel = user?.level || 0;

  return { token, user, setUser, loading, setToken, userLevel };
}
