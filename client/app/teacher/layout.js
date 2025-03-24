'use client'

import '@/styles/globals.css'
import React from 'react'
import styles from './teacher-layout.module.scss'
import TeacherSidebar from './_component/teacher-sidebar/page'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppProvider from '@/hooks/app-provider'

export default function TeacherRootLayout({ children }) {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        className="custom-toast-container" 
      />
      
      <AppProvider>
        <section className="center-dashboard">
          <div className="container-fluid">
            <div className="row">
              <div className={styles['col-md-3'] + ' col-md-3 col-lg-2'}>
                <TeacherSidebar />
              </div>
              <div className="col-xl-12 col-xxl-10">{children}</div>
            </div>
          </div>
        </section>
      </AppProvider>
    </>
  )
}
