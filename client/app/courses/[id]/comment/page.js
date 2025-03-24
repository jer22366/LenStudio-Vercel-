'use client'

import { useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import styles from "./comment.module.scss";
import CourseComment from "@/app/courses/[id]/_components/course-comment/page";
import { IoIosArrowBack } from "react-icons/io";

export default function CommentPage(props) {
    const { id: courseId } = useParams(); // ✅ 取得課程 ID
    const searchParams = useSearchParams();
    const commentId = searchParams.get("commentId"); // ✅ 取得評論 ID
    const [comments, setComments] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const modalContentRef = useRef(null);


    useEffect(() => {
        if (!courseId) return;

        const fetchComments = async () => {
            try {
                const res = await fetch(`https://lenstudio.onrender.com/api/courses/${courseId}/comments`);
                if (!res.ok) throw new Error("無法獲取評論資料");

                const data = await res.json();
                setComments(data);

                // ✅ 計算平均評分
                const validRatings = data.map((comment) => parseFloat(comment.rating)).filter((rating) => !isNaN(rating));
                const avg = validRatings.length ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length : 0;
                setAverageRating(avg.toFixed(1));
            } catch (err) {
                console.error("❌ 載入評論失敗:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [courseId]);

    useEffect(() => {
        if (commentId) {
            setTimeout(() => {
                const targetComment = document.getElementById(`comment-${commentId}`);
                if (targetComment) {
                    const headerOffset = 280; // 🚀 調整這裡，根據你的導航欄高度（可嘗試 50-100px）
                    const elementPosition = targetComment.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }, 500);
        }
    }, [commentId]);


    return (
        <div className={styles['modal']}>
            <div className={styles["back-btn"]}>
                <button
                    onClick={() => {
                        window.location.href = `/courses/${courseId}#course-rating`;
                    }}
                    className={styles["back-link"]}
                >
                    <IoIosArrowBack /> 返回頁面
                </button>
            </div>

            <h2>所有評論</h2>
            <div className={styles['modal-content']} ref={modalContentRef}>
                {comments.map((comment, index) => (
                    <CourseComment
                        key={comment.id}
                        commentId={comment.id}
                        name={comment.user_name}
                        date={comment.created_at}
                        rating={comment.rating}
                        title={comment.title || '無標題'}
                        content={comment.content}
                        imgSrc={comment.user_head || '/images/default-avatar.jpg'}
                        isModal={true}
                        id={`comment-${comment.id}`}
                    />
                ))}
            </div>
        </div >
    )
}
