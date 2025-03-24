// rent-breadcrumb

import Link from "next/link";

export default function RentBreadcrumb() {
  return (
    <div aria-label="breadcrumb" className="breadcrumb-container k-breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">首頁</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          租借列表
        </li>
      </ol>
    </div>
  );
}
