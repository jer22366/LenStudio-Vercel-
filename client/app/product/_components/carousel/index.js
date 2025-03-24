'use client'

import React, { useEffect } from 'react'
import styles from "./carousel.module.scss";

export default function CarouselIndex(props) {

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => {
      })
      .catch((err) => console.error("載入 Bootstrap JS 失敗:", err));
  }, []);

  return (
    <div className="container-fluid px-0">
      <div id="carouselExampleIndicators" className={`carousel slide ${styles.carousel}`} data-bs-ride="carousel">

        {/* 🔹 輪播指示器 */}
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={0} className="active" aria-current="true" aria-label="Slide 1" />
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={1} aria-label="Slide 2" />
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={2} aria-label="Slide 3" />
        </div>

        {/* 🔹 輪播內容 */}
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="images/product/ff80808193438b04019343a38b6d0000_Alpha-universe_pc_d00004604.jpg" className="d-block w-100" alt="..." />
          </div>
          <div className="carousel-item">
            <img src="images/product/ff80808191504b7801919770a5531e0c_SEL85F14GM2_pc_31e0c2520.jpg" className="d-block w-100" alt="..." />
          </div>
          <div className="carousel-item">
            <img src="images/product/ff808081939a01e60193b504e4c91c79_A1II_pc_91c792058.jpg" className="d-block w-100" alt="..." />
          </div>
        </div>

        {/* 🔹 輪播控制箭頭 */}
        <button className={`carousel-control-prev ${styles.carouselPrev}`} type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Previous</span>
        </button>
        <button className={`carousel-control-next ${styles.carouselNext}`} type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
}
