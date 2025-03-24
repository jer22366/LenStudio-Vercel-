"use client"

import React, { useState, useEffect } from 'react';
import AdminChatWidget from './admin-chat';
import UserChatWidget from './user-chat';
import { SocketProvider } from './context/socketContext';
import useAuthHook from '@/hooks/use-auth';

/**
 * 聊天室選擇器組件
 * 根據用戶等級決定顯示哪種聊天室介面
 * 
 * @param {Object} props 組件屬性
 * @returns {JSX.Element} 相應的聊天室組件
 */
export default function Chat() {
  const { user } = useAuthHook();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // 根據用戶級別決定是否為管理員
    setIsAdmin(user?.level === 2);
  }, [user]);
  
  // 創建 socketUser 對象
  const socketUser = {
    id: user?.id || 'visitor-' + Date.now(),
    name: user?.name || '訪客',
    token: user?.token || localStorage.getItem('authToken'),
    level: user?.level || 0
  };
  
  return (
    <SocketProvider user={socketUser} isAdmin={isAdmin}>
      {isAdmin ? <AdminChatWidget /> : <UserChatWidget />}
    </SocketProvider>
  );
}