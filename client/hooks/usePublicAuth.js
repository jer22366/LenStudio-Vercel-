import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function usePublicAuth() {
  const appKey = "loginWithToken";
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({name: "", nickname: "", birthday: ""});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(appKey);

    if (savedToken) {
      try {
        const decodedUser = jwtDecode(savedToken);
        setToken(savedToken);
        setUser(decodedUser || {});
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token 解碼失敗", error);
        localStorage.removeItem(appKey);
      }
    }

    setLoading(false);
  }, []);
  
  return { token, user, isAuthenticated, loading, setToken, setUser };
}