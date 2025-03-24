"use client";

import { useState, useEffect } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./favorite-button.module.scss";
import { useFavorite } from "@/hooks/use-collection";

export default function FavoriteButtonG({ productId, courseId, articleId, rentId, className }) {
  const [token, setToken] = useState(null);
  const { favoriteItems = {}, toggleFavorite } = useFavorite();
  const [isFavorite, setIsFavorite] = useState(false); // ✅ 初始收藏狀態

  // 確定收藏類型
  const itemType = productId
    ? "product"
    : courseId
      ? "course"
      : articleId
        ? "article"
        : rentId
          ? "rent"
          : null;

  const itemId = productId || courseId || articleId || rentId;

  // 讀取 `token`
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("loginWithToken");
      console.log("🔑 取得 token:", storedToken);
      setToken(storedToken);
    }
  }, []);

  // ✅ 檢查收藏狀態（初始載入時）
  useEffect(() => {
    if (!token || !itemId || !itemType) return;

    console.log("📌 發送 `GET` 收藏查詢:", `https://lenstudio.onrender.com/api/collect/${itemType}/collection/${itemId}`);

    const checkFavoriteStatus = async () => {
      try {
        const res = await fetch(
          `https://lenstudio.onrender.com/api/collect/${itemType}/collection/${itemId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("無法取得收藏狀態");

        const data = await res.json();
        console.log(`✅ API 回傳收藏狀態 (${itemType} - ${itemId}):`, data);


        if (typeof data.isFavorite !== "undefined") {
          setIsFavorite(data.isFavorite);  // ✅ 確保 UI 正確更新
          toggleFavorite(itemType, itemId, data.isFavorite);
        }
      } catch (error) {
        console.error("❌ 無法確認收藏狀態:", error);
      }
    };

    checkFavoriteStatus();
  }, [itemId, token]);

  // 收藏或取消收藏
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.warn("請先登入，即可收藏！", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const method = isFavorite ? "DELETE" : "POST";
      let url = `https://lenstudio.onrender.com/api/collect/${itemType}/collection/${itemId}`; // ✅ 正確的路徑

      if (method === "POST") {
        url = `https://lenstudio.onrender.com/api/collect/${itemType}/collection/me`; // ✅ 正確的 POST 路徑
      }

      console.log("📌 送出的請求:", method, url);

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body:
          method === "POST" ? JSON.stringify({ [`${itemType}_id`]: itemId }) : null,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setIsFavorite(!isFavorite); // ✅ 更新 UI 狀態
      toggleFavorite(itemType, itemId, !isFavorite); // ✅ 更新 global 狀態

      toast.success(isFavorite ? "已取消收藏！" : "成功加入收藏！", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("收藏錯誤:", error);
      toast.error("操作失敗：" + (error.message || "發生錯誤，請稍後再試"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={`${styles.favoriteIcon} ${className || ""}`}
    >
      {isFavorite ? (
        <FaHeart size={22} color="#e58e41" />
      ) : (
        <FaRegHeart size={22} color="gray" />
      )}
    </button>
  );
}
