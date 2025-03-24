import { createContext, useContext, useState, useEffect } from "react";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]); // 所有課程
  const [course, setCourse] = useState(null); // 單筆課程
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 取得所有課程
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://lenstudio.onrender.com/api/courses");
      if (!res.ok) throw new Error("❌ 無法獲取課程列表");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 取得單筆課程資料
  const fetchCourseById = async (courseId) => {
    setLoading(true);
    try {
      const res = await fetch(`https://lenstudio.onrender.com/api/courses/${courseId}`);
      if (!res.ok) throw new Error("❌ 無法獲取課程");
      const data = await res.json();
      setCourse(data);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  // ✅ 新增課程
  const addCourse = async (newCourse) => {
    setLoading(true);
    try {
      const res = await fetch("https://lenstudio.onrender.com/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) throw new Error("❌ 新增課程失敗");
      const addedCourse = await res.json();
      setCourses((prev) => [...prev, addedCourse]); // 新增至課程列表
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 更新課程
  const updateCourse = async (courseId, updatedData) => {
    setLoading(true);
    try {
      const res = await fetch(`https://lenstudio.onrender.com/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("❌ 更新課程失敗");
      const updatedCourse = await res.json();

      // 更新前端的課程列表
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? updatedCourse : course))
      );
      setCourse(updatedCourse);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 刪除課程
  const deleteCourse = async (courseId) => {
    setLoading(true);
    try {
      const res = await fetch(`https://lenstudio.onrender.com/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("❌ 刪除課程失敗");

      // 更新前端的課程列表
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        course,
        loading,
        error,
        fetchCourses,
        fetchCourseById,
        addCourse,
        updateCourse,
        deleteCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

// 🔥 使用 CourseContext 的 Custom Hook
export const useCourses = () => {
  return useContext(CourseContext);
};
