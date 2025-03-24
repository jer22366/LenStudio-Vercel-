import RentBreadcrumb from './_components/rent-breadcrumb/page'
import RentList from './_components/rent-list/page'

import './rent-list.scss'

export default function RentalPage() {
  return (
    <div className="container-fluid k-body">
      <div className="container" style={{ paddingTop: '120px' }}>
        <RentBreadcrumb />
        <div className="pb-5" >
          <RentList />
        </div>
      </div>
    </div>
  )
}
