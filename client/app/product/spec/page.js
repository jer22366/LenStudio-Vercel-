'use client'

import React from 'react'
import ComponentsCompareItem from './_components/spec-item'
import ComponentsCompareTable from './_components/spec-table'
import BreadcrumbIndex from "./_components/breadcrumb"

export default function ComparePage() {
  return (
    <div className="container">
    <div className="row">
      <BreadcrumbIndex />
      <ComponentsCompareItem />
      <ComponentsCompareTable />
      </div>
    </div>
  )
}
