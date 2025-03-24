import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";

const TeacherContext = createContext();

export const TeacherProvider = ({ children }) => {
  const [teachers, setTeachers] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchAllTeachers = async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("loginWithToken") : null;

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("https://lenstudio.onrender.com/api/teachers", {
        method: "GET",
        headers,
      });

      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error("❌ 獲取講師列表失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherById = async (teacherId) => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("loginWithToken") : null;

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://lenstudio.onrender.com/api/teachers/${teacherId}`, {
        method: "GET",
        headers,
      });

      const data = await res.json();
      setTeacher(data);
    } catch (err) {
      console.error("❌ 獲取講師資料失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchAllTeachers();
    }
  }, []);

  return (
    <TeacherContext.Provider value={{ teachers, teacher, fetchTeacherById, loading }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeachers = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error("useTeachers 必須在 TeacherProvider 內使用！");
  }
  return context;
};
