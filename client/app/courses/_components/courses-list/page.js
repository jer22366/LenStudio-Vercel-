import { useState, useEffect, useMemo } from "react";
import CourseCard from "@/app/courses/_components/course-card/page"; // ✅ 引入 `CourseCard`
import Pagination from "@/app/courses/_components/pagination/page"
import { toast } from "react-toastify";
import styles from "./courses-list.module.scss";

export default function CourseList({ courses }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [popularCourses, setPopularCourses] = useState([]);
  const [filterChangeId, setFilterChangeId] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [token, setToken] = useState(null);
  const coursesPerPage = 12;
  const mobileLoadMore = 4;
  const [visibleCourses, setVisibleCourses] = useState(mobileLoadMore);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setVisibleCourses(mobileLoadMore);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      setCurrentPage(1);
      setFilterChangeId((prev) => prev + 1);
    }
  }, [courses]);

  const publishedCourses = useMemo(() => {
    return courses.filter((course) => course.status === "published");
  }, [courses]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = useMemo(() => {
    return isMobile
      ? publishedCourses.slice(0, visibleCourses)
      : publishedCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);
  }, [publishedCourses, currentPage, visibleCourses, isMobile]);

  // 手機版點擊「更多課程」按鈕時增加可見數量
  const loadMoreCourses = () => {
    setVisibleCourses((prev) => Math.min(prev + mobileLoadMore, publishedCourses.length));
  };
  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        const res = await fetch("https://lenstudio.onrender.com/api/courses?sort=popular");
        if (!res.ok) throw new Error(`HTTP 錯誤！狀態碼：${res.status}`);

        const data = await res.json();
        setPopularCourses(data.filter((course) => course.status === "published").slice(0, 4));
      } catch (err) {
        console.error("載入熱門課程失敗:", err.message);
      }
    };

    fetchPopularCourses();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("loginWithToken");
    if (storedToken) {
      setToken(storedToken);

      // ✅ 確保 `favorites` 會更新
      fetchFavorites(storedToken).then((favSet) => {
        setFavorites(favSet);
        // console.log("📌 更新收藏列表:", favSet);
      });
    }
  }, []);


  const fetchFavorites = async (token) => {
    try {
      const res = await fetch("https://lenstudio.onrender.com/api/courses/collection", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("無法取得收藏清單");

      const data = await res.json();
      // console.log("✅ API 回傳所有收藏課程:", data);

      return new Set(data.favorites.map((course) => Number(course.id)));
    } catch (error) {
      console.error("❌ 收藏清單載入錯誤:", error);
      return new Set();
    }
  };



  const toggleFavorite = async (courseId) => {
    if (!token) {
      toast.warn("請先登入才能收藏課程！", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      const isFavorited = favorites.has(courseId);
      const method = isFavorited ? "DELETE" : "POST";
      let url = "https://lenstudio.onrender.com/api/courses/collection";
      if (method === "DELETE") url = `https://lenstudio.onrender.com/api/courses/collection/${courseId}`;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ course_id: courseId }) : null,
      });

      if (!res.ok) throw new Error(await res.text());

      setFavorites((prev) => {
        const updatedFavorites = new Set(prev);
        if (isFavorited) updatedFavorites.delete(Number(courseId));
        else updatedFavorites.add(Number(courseId));

        // console.log("📌 收藏狀態更新:", updatedFavorites);
        return updatedFavorites;
      });

      toast.success(isFavorited ? "已取消收藏！" : "成功加入收藏！", { position: "top-right", autoClose: 2000 });

    } catch (error) {
      console.error("❌ 收藏操作錯誤:", error);
      toast.error("操作失敗：" + (error.message || "發生錯誤，請稍後再試"), { position: "top-right", autoClose: 3000 });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const courseList = document.getElementById("course-list");
    if (courseList) {
      const offset = 200; // 例如：上移 50px
      const elementTop = courseList.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementTop - offset,
        behavior: "smooth",
      });
    }
  };


  return (
    <section className={`container ${styles["course-list"]}`} id="course-list">
      {publishedCourses.length === 0 && currentCourses.length === 0 ? (
        <>
          <div className={styles["notfound"]}>
            <p>找不到符合條件的課程，試試其他關鍵字吧！</p>
          </div>

          {popularCourses.length > 0 && (
            <div className={styles["recommended-section"]}>
              <div className={styles["pop-course"]}>
                <div className={styles["title-block"]}></div>
                <h3>你可能會喜歡這些熱門課程：</h3>
              </div>

              <div className="row">
                {popularCourses.map((course) => (
                  <CourseCard
                    key={`${course.id}-${filterChangeId}`}
                    course={course}
                    isFavorite={favorites.has(course.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="row mt-4">
            {currentCourses.length === 0 ? (
              <p>找不到符合條件的課程，試試其他關鍵字吧！</p>
            ) : (
              currentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={favorites.has(Number(course.id))}
                  onToggleFavorite={toggleFavorite}
                />

              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(publishedCourses.length / coursesPerPage)}
            onPageChange={handlePageChange}
          />

          {isMobile && visibleCourses < publishedCourses.length && (
            <div className={styles["load-more-btn-container"]}>
            <button onClick={loadMoreCourses} className={styles["load-more-btn"]}>
              更多課程
            </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}