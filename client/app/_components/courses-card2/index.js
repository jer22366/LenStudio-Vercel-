'use client'

import React from 'react'
import styles from './CoursesCard.module.scss'
import Link from 'next/link'
import 'swiper/css'
import 'swiper/css/autoplay'
import Image from 'next/image'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect, useRef } from "react";
import "hover.css"
import Marquee from "react-fast-marquee";

const categories = [
  { title: '所有課程', image: 'images/course-cover/course_12_1.avif', link: '/courses/12' },
  { title: '所有課程', image: 'images/course-cover/course_24_1.jpg', link: '/courses/24' },
  { title: '所有課程', image: 'images/course-cover/course_55_1.avif', link: '/courses/55' },
  { title: '所有課程', image: 'images/course-cover/course_13_1.avif', link: '/courses/13' },
  { title: '所有課程', image: 'images/course-cover/course_26_1.jpg', link: '/courses/26' },
  { title: '所有課程', image: 'images/course-cover/course_18_1.avif', link: '/courses/18' },
  { title: '所有課程', image: 'images/course-cover/course_29_1.avif', link: '/courses/29' },
]

const duplicatedCategories = [...categories, ...categories];
const rating = 4.8
const totalStars = 5

export default function CoursesCardIndex2() {

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      debounceDelay: 50,
      throttleDelay: 99,
    })
  }, [])


  return (
    <div className={styles.courseArea}>
      <div className="px-3 py-3 px-md-5 py-md-5 ">
        <h2 className={`${styles.courseTitle} text-left mb-4 ps-4`}>精選課程</h2>
      </div>

      {/* 使用 react-fast-marquee */}
      <div className={styles.marquee}>
        <Marquee
          gradient={false}
          speed={70}
          pauseOnHover={true} // 滑鼠懸停時暫停
          pauseOnClick={true} // 滑鼠點擊時暫停
          autoFill={false} // 不自動填充
        >
          {duplicatedCategories.map((category, index) => (
            <Link href={category.link} key={index}>
              <div className={styles.courseCard}>
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-72 object-cover"
                />
              </div>
            </Link>
          ))}
        </Marquee>
      </div>
      <div className={styles.textBoxContainer}>
        <div className={styles.textBox} data-aos="fade-down" data-aos-delay="000"><div className={`${styles.textBoxNum} ${styles.shinyText}`}>200+</div><div className={styles.text}>精選課程</div></div>
        <div className={styles.textBox} data-aos="fade-down" data-aos-delay="300"><div className={`${styles.textBoxNum} ${styles.shinyText}`}>300K+</div><div className={styles.text}>學員人數</div></div>
        <div className={styles.textBox} data-aos="fade-down" data-aos-delay="500"><div className={`${styles.textBoxNum} ${styles.shinyText}`}>100+</div><div className={styles.text}>師資</div></div>
        <div className={styles.textBox} data-aos="fade-down" data-aos-delay="700"><div className={`${styles.textBoxNum} ${styles.shinyText}`}>    {rating.toFixed(1)}
          {Array.from({ length: totalStars }, (_, i) => (
            <FaStar key={i} className={styles.starIcon} />
          ))}
        </div><div className={styles.text}>課程評分</div></div>
      </div>
    </div>
  )
}