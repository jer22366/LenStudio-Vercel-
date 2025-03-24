'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './courses-banner.module.scss'
import BlurText from "@/app/courses/_components/blur-text/BlurText";
// import FuzzyText from '@/app/courses/_components/blur-text/FuzzyText';
import GlitchText from '@/app/courses/_components/blur-text/GlitchText';
import { useState } from 'react'


export default function CoursesBanner({ courses }) {
  // 過濾出精選課程
  const featuredCourses = courses.filter(course => course.is_featured === 1)
  // const [hoverIntensity, setHoverIntensity] = useState(0.5);
  // const [enableHover, setEnableHover] = useState(true);

  if (featuredCourses.length === 0) return <p className="text-warning">目前沒有精選課程</p>

  const handleAnimationComplete = () => {
    // console.log('Animation completed!');
  };

  return (
    <section className={styles['course-banner']}>
      <BlurText
        text="TRENDING NOW"
        delay={150}
        animateBy="words"
        direction="top"
        onAnimationComplete={handleAnimationComplete}
        className={`text-2xl mb-8 ${styles.blurText}`}
      />
      {/* <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={hoverIntensity}
        enableHover={enableHover}
      >
        TRENDING NOW
      </FuzzyText> */}
      {/* <GlitchText
        speed={1}
        enableShadows={true}
        enableOnHover={true}
        className={styles['eGlitchText']}
      >
        TRENDING NOW
      </GlitchText> */}

      <div className={styles['banner-title']}>
        <span className="icon">
          <img src="/images/icon/choice.svg" alt="Icon" />
        </span>
        <p>精選課程</p>
      </div>

      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView="auto"
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        speed={1000}
      >
        {featuredCourses.map((course) => (
          <SwiperSlide key={course.id} className={styles['swiper-slide']}>
            <a href={`/courses/${course.id}`}>
              <img
                src={course.image_url || '/images/default-course.jpg'}
                alt={course.title}
                className={styles['course-image']}
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
