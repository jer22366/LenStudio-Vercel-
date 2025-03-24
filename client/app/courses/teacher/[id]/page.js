'use client';

import { useParams } from "next/navigation"
import { useState, useEffect } from "react";
import styles from './teacher-mobile.module.scss'
import {
    FaChevronRight,
    FaGlobe,
    FaFacebook,
    FaInstagram,
    FaYoutube,
} from 'react-icons/fa'
import Link from "next/link";
import TeacherCoursesList from '@/app/courses/[id]/_components/teacher-courses-list/page'
import { IoIosArrowBack } from "react-icons/io";

export default function IdPage() {
    const { id } = useParams(); // 取得 teacherId
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return; //  確保 id 準備好後才發送請求

        const fetchTeacher = async () => {
            try {
                const response = await fetch(`https://lenstudio.onrender.com/api/teachers/${id}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setTeacher(data);
            } catch (error) {
                console.error("獲取講師資料失敗:", error);
                setTeacher(null); // 確保 teacher 狀態歸零
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [id]);// ✅ 只在 id 存在且 router 準備好後執行

    if (loading) return <p>載入中...</p>;
    if (!teacher) return <p>無法找到講師資料</p>;


    return (
        <div className={styles['modal-body']}>
            {/* 左側：講師頭像 + 社群連結 */}
            <div className={styles['modal-left-container']}>
                <div className={styles["back-btn"]}>
                    <button
                        onClick={() => {
                            if (teacher.courses.length > 0) {
                                window.location.href = `/courses/${teacher.courses[0].id}#teacher-info`; // ✅ 返回對應課程
                            } else {
                                window.location.href = "/courses"; // ✅ 如果沒有課程，則回到課程列表
                            }
                        }}
                        className={styles["back-link"]}
                    >
                        <IoIosArrowBack /> 返回頁面
                    </button>
                </div>


                <div className={styles['modal-left']}>
                    <div className={styles['modal-left-img']}>
                        <img
                            src={
                                teacher.image || '/images/teacher/default.avif'
                            }
                            alt={teacher.name}
                            className={styles['modal-img']}
                        />
                    </div>
                    <h2 className={styles['teacher-name']}>
                        {teacher.name}
                    </h2>

                    <div className={styles['social-links']}>
                        {teacher.website && (
                            <a
                                href={teacher.website}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaGlobe />
                            </a>
                        )}
                        {teacher.facebook && (
                            <a
                                href={teacher.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaFacebook />
                            </a>
                        )}
                        {teacher.instagram && (
                            <a
                                href={teacher.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaInstagram />
                            </a>
                        )}
                        {teacher.youtube && (
                            <a
                                href={teacher.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaYoutube />
                            </a>
                        )}
                    </div>
                    <hr />
                </div>
                <ul className={styles['modal-teacher-data']}>
                    <li className={styles['data-item']}>
                        <img src="/images/icon/course-icon-w.svg" alt="" />
                        <p>
                            {teacher.courseCount?.toLocaleString('en-US') ||
                                '0'}{' '}
                            堂課程
                        </p>
                    </li>
                    <li className={styles['data-item']}>
                        <Link href={`/article?user_id=${teacher.user_id}&author_name=${encodeURIComponent(teacher.author_name)}`} className={styles['link-wrapper']} >
                            <img src="/images/icon/article-icon-w.svg" alt="" />
                            <p>{teacher.articleCount?.toLocaleString() || "0"} 篇文章</p>
                        </Link>
                    </li>
                    <li className={styles['data-item']}>
                        <img src="/images/icon/student-icon-w.svg" alt="" />
                        <p>
                            {Number(teacher.studentCount)?.toLocaleString(
                                'en-US'
                            ) || '0'}{' '}
                            位學生
                        </p>
                    </li>
                </ul>
            </div>

            {/* 右側：簡介 + 課程 */}
            <div className={styles['modal-right']}>
                <p>{teacher.bio}</p>
                <hr className={styles['hr-line']} />
                <TeacherCoursesList courses={teacher.courses || []} />
            </div>
        </div>
    )
}
