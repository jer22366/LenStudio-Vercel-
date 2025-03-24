
import { createContext, useContext, useState, useEffect } from "react";

// 創建 Context
const UserContext = createContext();

// 提供者組件
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]); // 所有使用者
  const [user, setUser] = useState(null); // 單筆使用者
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://lenstudio.onrender.com/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      });
  }, []);

  // 取得單筆使用者資料
  const fetchUserById = (userId) => {
    setLoading(true);
    fetch(`https://lenstudio.onrender.com/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setLoading(false);
      });
  };

  return (
    <UserContext.Provider value={{ users, user, fetchUserById, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// 使用 Context 的 Hook
export const useUsers = () => {
  return useContext(UserContext);
};
