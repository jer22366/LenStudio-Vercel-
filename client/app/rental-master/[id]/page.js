import RentBreadcrumb from './_components/rent-breadcrumb/page'
import RentDetail from './_components/rent-detail/page'

import './rent-detail.scss'

export default function RentalPage() {
  return (
    <>
      <div className="container-fluid k-body px-0">
        <div className="container" style={{ paddingTop: '120px' }}>
          {/* Breadcrumb */}
          <RentBreadcrumb />
        </div>
        <div className="pt-5">
          <RentDetail />
        </div>
      </div>
    </>
  )
}
