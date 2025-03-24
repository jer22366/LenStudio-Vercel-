"use client";
import { useState, useEffect } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { toast } from "react-toastify";
import styles from "./favorite-button.module.scss";

export default function FavoriteButton({ courseId, isFavorite, onToggleFavorite }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(courseId);
  };


  return (
    <button onClick={handleFavoriteClick} className="e-favorite-icon hvr-push">
      {isFavorite ? <FaHeart size={18} color="white" className="hvr-icon"/> : <FaRegHeart size={18} color="white" />}
    </button>
  );
}
