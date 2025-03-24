"use client";

import styles from "./detail-nav.module.scss";

export default function DetailNav() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      <div className={styles["detail-nav-links"]}>
        <a
          href="#"
          className={styles["detail-nav-link"]}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("course-content");
          }}
        >
          <div className={styles["circle"]}></div>
          <p>課程內容</p>
        </a>
        <a
          href="#"
          className={styles["detail-nav-link"]}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("teacher-info");
          }}
        >
          <div className={styles["circle"]}></div>
          <p>講師資訊</p>
        </a>
        <a
          href="#"
          className={styles["detail-nav-link"]}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("course-rating");
          }}
        >
          <div className={styles["circle"]}></div>
          <p>評價</p>
        </a>
        <a
          href="#"
          className={styles["detail-nav-link"]}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("related-courses");
          }}
        >
          <div className={styles["circle"]}></div>
          <p>相關課程推薦</p>
        </a>
      </div>
      <div className={`${styles["line"]} d-none d-sm-block`}></div>
    </>
  );
}
