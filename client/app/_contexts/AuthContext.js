"use client"

import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 檢查用戶登入狀態
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = Cookies.get('authToken') || localStorage.getItem('authToken');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // 驗證令牌並獲取用戶資訊
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/status`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.status === 'success') {
          // 解析 JWT 獲取用戶信息（不需要做後端請求）
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.id,
            account: payload.account,
            name: payload.name,
            nickname: payload.nickname,
            level: payload.level,
            head: payload.head
          });
        }
      } catch (error) {
        console.error('驗證用戶失敗:', error);
        Cookies.remove('authToken');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);