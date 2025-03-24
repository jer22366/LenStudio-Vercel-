'use client'
import Link from 'next/link'
import styles from './course.module.scss'
import React from 'react'
import useAuth from '@/hooks/use-auth'
import Sidenav from '../_components/Sidenav/page'
import CourseCard from './_components/course-card/page'

export default function UserPage(props) {
    const { token, user, loading } = useAuth();
  
    if (loading) {
      return <div className="text-center mt-5">載入中...</div>;
    }

  return (
    <div className="container py-4">
      <div className={`row ${styles.marginTop}`}>
        {/* 側邊選單 */}
        <Sidenav />

        {/* 主要內容區 */}
        <CourseCard />
      </div>
    </div>
  )
}
