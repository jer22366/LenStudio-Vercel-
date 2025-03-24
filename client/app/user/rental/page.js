'use client';

import styles from './rental.module.scss'; // 引入 CSS Modules
import React from 'react';
import useAuth from '@/hooks/use-auth';
import Sidenav from '../_components/Sidenav/page';
import Rentcard from './_components/rent-card/page'

import './user-rental.scss'

export default function UserPage() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-5">載入中...</div>;
  }
  return (
    <div className="container py-4">
      <div className={`row ${styles.marginTop}`}>
        {/* 側邊選單 */}
        <Sidenav />

        {/* Main Content */}
        <div className="col-lg-9 py-4">
          <h1 className={`mb-4 ${styles.h1}`}>我的租賃</h1>

          {/* 租賃 Section */}

          <Rentcard />

        </div>

      </div>

    </div>
  );
}
