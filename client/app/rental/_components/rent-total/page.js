// rent-total

export default function RentTotal({ totalItems, itemsPerPage, currentPage }) {
  // 📌 計算當前頁面的實際顯示數量
  const firstItemIndex = (currentPage - 1) * itemsPerPage // 當前頁的第一個項目的索引
  const lastItemIndex = Math.min(firstItemIndex + itemsPerPage, totalItems) // 確保最後一頁的數量正確

  return (
    <div className="k-total-mobile">
      <span>
        顯示 {firstItemIndex + 1} - {lastItemIndex} 項，共 {totalItems} 項
      </span>
    </div>
  )
}
