'use client'

import React from 'react'
import style from './index.module.scss'

export default function Breadcrumb() {
  return (
    <>
      <section className={style['y-container']}>
        <div className={style['y-breadcrumb']}>
          <a href="#" className="text-decoration-none">首頁</a>
          <span className="mx-2">&gt;</span>
          <a href="#" className="text-decoration-none">最新消息</a>
        </div>
      </section>
    </>
  )
}
