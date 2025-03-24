'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './course-management.module.scss'
import { FaBars, FaList, FaSearch, FaPlusSquare, FaEye } from 'react-icons/fa'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import Pagination from '../courses/_components/pagination/page'
import Link from 'next/link'
import Swal from 'sweetalert2';

export default function CourseManagement() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const coursesPerPage = 5;

  // **先獲取使用者資訊**
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('loginWithToken');
        if (!token) {
          // console.log('⛔️ 沒有 Token，跳轉登入頁面');
          router.push('/login');
          return;
        }

        // console.log('📡 正在發送請求取得使用者資訊...');
        const userRes = await fetch('https://lenstudio.onrender.com/api/teachers/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error(`API 錯誤: ${userRes.status}`);

        const userData = await userRes.json();
        // console.log('✅ 取得使用者資訊:', userData);

        // **確保 `level` 有值，預設為 0 (一般會員)**
        const userLevel = userData.level ?? 0; // 如果 `level` 為 `null` 或 `undefined`，預設為 0
        // console.log(`📌 使用者 Level: ${userLevel}`);

        // **儲存 `userRole` 到 localStorage**
        const userRole =
          userLevel === 1 ? "teacher" :
            userLevel === 88 ? "admin" :
              "user"; // 🚀 預設為一般會員

        localStorage.setItem("userRole", userRole);
        // console.log("📌 `userRole` 已存入 localStorage:", userRole);

        setUser({
          name: userData.teacher_name || userData.name || "未命名",
          level: userLevel, // ✅ 確保 `level` 一定有值
          email: userData.mail,
        });

        // **如果是一般會員 (`level === 0`)，跳轉 `/dashboard`**
        if (userRole === "user") {
          console.warn("⚠️ 一般會員登入，導向 dashboard");
          router.push('/');
        }

      } catch (error) {
        console.error('❌ 獲取使用者資訊失敗:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, []);


  // **獲取課程資訊**
  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("loginWithToken");
        let coursesUrl = "";

        if (user.level === 1) {
          coursesUrl = "https://lenstudio.onrender.com/api/teachers/me/courses";
        } else if (user.level === 88) {
          // console.log("🔹 管理員登入");
          coursesUrl = "https://lenstudio.onrender.com/api/teachers/admin/courses";
        } else {
          console.warn("⚠️ 無權限訪問，跳轉到 /");
          router.push("/");
          return;
        }

        // console.log("📡 正在發送請求到:", coursesUrl);
        const coursesRes = await fetch(coursesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!coursesRes.ok) throw new Error(`API 錯誤: ${coursesRes.status}`);

        const coursesData = await coursesRes.json();
        // console.log("✅ 取得課程資料:", coursesData);

        // **這裡確保 coursesData 是陣列**
        if (!Array.isArray(coursesData)) {
          throw new Error("課程資料格式錯誤，應為陣列");
        }

        setCourses(coursesData);
      } catch (error) {
        console.error("❌ 獲取課程失敗:", error);
        setCourses([]); // 🚀 **確保 `setCourses()` 至少設置為空陣列**
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);


  useEffect(() => {
    // console.log('📌 目前的 courses:', courses);
    if (courses.length > 0) {
      setCurrentPage(1);
    }
  }, [courses]);

  // 刪除課程
  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "確定要刪除此課程嗎?",
      html: `
    <p style="line-height: 1.6; font-size: 16px; color: #666;">
      若想保留課程內容，請先下架或備份內容
    </p>
  `,
      showCancelButton: true,
      confirmButtonColor: "#e58e41",
      cancelButtonColor: "#666666",
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("loginWithToken");
        const res = await fetch(`https://lenstudio.onrender.com/api/courses/${courseId}/delete`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("刪除課程失敗");

        setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));

        Swal.fire({
          title: "已刪除！",
          text: "該課程已成功刪除。",
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: "OK",
          confirmButtonColor: "#143146",
        });
      } catch (error) {
        console.error("❌ 刪除課程失敗:", error);
        Swal.fire("錯誤！", "刪除失敗，請稍後再試。", "error");
      }
    }
  };


  //修改上下架狀態
  const handleToggleStatus = async (courseId, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";


    const result = await Swal.fire({
      title: `確定要${newStatus === "published" ? "上架" : "下架"}這堂課程嗎？`,
      text: newStatus === "published"
        ? "上架後，學員可以瀏覽及購買此課程。"
        : "下架後，學員將無法瀏覽及購買此課程。",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "published" ? "#4CAF50" : "#d33",
      confirmButtonColor: "#e58e41",
      cancelButtonColor: "#666666",
      confirmButtonText: newStatus === "published" ? "上架課程" : "下架課程",
      cancelButtonText: "取消",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("loginWithToken");

      const res = await fetch(`https://lenstudio.onrender.com/api/courses/${courseId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("更新狀態失敗");


      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, status: newStatus } : course
        )
      );

      await Swal.fire({
        title: `${newStatus === "published" ? "已上架！" : "已下架！"}`,
        text: `課程已成功${newStatus === "published" ? "上架" : "下架"}。`,
        icon: "success",
        confirmButtonColor: "#143146",
      });

      // console.log(`📌 課程 ${courseId} 狀態已更新為 ${newStatus}`);
    } catch (error) {
      console.error("❌ 狀態更新失敗:", error);

      Swal.fire({
        title: "更新失敗",
        text: "無法更改課程狀態，請稍後再試。",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };


  // **搜尋 & 分頁**
  const filteredCourses = courses.filter(
    (course) =>
      course.title.includes(searchTerm) || course.category.includes(searchTerm)
  );

  const totalPages = filteredCourses.length > 0 ? Math.ceil(filteredCourses.length / coursesPerPage) : 1;
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // console.log('📌 當前顯示的課程列表:', currentCourses);
  // console.log('📌 當前頁碼:', currentPage, ' / 總頁數:', totalPages);

  if (loading) return <p>載入中...</p>;

  return (
    <>
      <div className={styles['center-content']}>
        <div className={styles['nav-bar']}>
          <h1>課程管理中心</h1>
          <p>
            您好，{user?.name}
            ！歡迎來到您的專屬教學平台，立即規劃並管理您的課程吧！
          </p>
        </div>

        <div className={styles['control-btns']}>
          <div className={styles['btns-left']}>
            <div className={styles['filter']}>
              <a href="#">
                <FaList />
                <p>篩選</p>
              </a>
            </div>

            <div className={styles['course-search']}>
              <input
                className={styles['search-input']}
                type="text"
                placeholder="搜尋課程"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className={styles['search-btn']}>
                <FaSearch />
              </button>
            </div>
          </div>

          <div className={styles['add']}>
            <Link href="/teacher/course/course-add">
              <FaPlusSquare />
              <p>新增課程</p>
            </Link>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table>
            <thead>
              <tr>
                <th>課程圖片</th>
                <th>課程名稱</th>
                <th>分類</th>
                <th>建立日期</th>
                <th>售價</th>
                {/* <th>銷售量</th> */}
                <th>學生人數</th>
                <th>發布狀態</th>
                <th>編輯</th>
                <th>刪除</th>
              </tr>
            </thead>
            <tbody>
              {currentCourses.map((course) => {
                {/* console.log(`📌 顯示課程:`, course) */ }
                const safeImage = course.image_url
                  ? course.image_url
                  : `/uploads/course-cover/${course.image_url}` ||
                  '/images/course-cover/default-course.jpg'
                return (
                  <tr key={course.id}>
                    <td className={styles['course-img']} data-label="課程圖片">
                      <Link
                        href={`/courses/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className={styles['image-container']}>
                          <img
                            src={safeImage}
                            alt={course.title}
                            className="img-fluid"
                          />
                          <div className={styles['overlay']}>
                            <FaEye className={styles['view-icon']} />
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td data-label="課程名稱">{course.title}</td>
                    <td data-label="分類">{course.category}</td>
                    <td data-label="建立日期">
                      {new Date(course.created_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td data-label="售價">{course.sale_price.toLocaleString()}</td>
                    {/* <td data-label="銷售量">
                      NT$
                      {(
                        course.sale_price * course.student_count
                      ).toLocaleString()}
                    </td> */}
                    <td data-label="學生人數">{course.student_count.toLocaleString()}</td>
                    <td data-label="發布狀態">
                      <div className={styles["state-toggle"]}>
                        <label className={styles["switch"]}>
                          <input
                            type="checkbox"
                            checked={course.status === "published"}
                            onChange={() => handleToggleStatus(course.id, course.status)}
                          />
                          <span className={styles["slider"]}></span>
                        </label>
                        <span>{course.status === "published" ? "上架中" : "未上架"}</span>
                      </div>
                    </td>

                    <td>
                      <Link
                        href={`/teacher/course/course-edit?id=${course.id}`}
                      >
                        <button className={styles['edit-btn']}>
                          <FiEdit />
                        </button>
                      </Link>
                    </td>
                    <td>
                      <button className={styles['delete-btn']} onClick={() => handleDeleteCourse(course.id)}>
                        <FiTrash2 />
                      </button>

                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  )
}