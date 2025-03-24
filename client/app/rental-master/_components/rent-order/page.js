// rent-order

'use client';

export default function RentOrder({ setSorting }) {
  return (
    <div className="d-flex justify-content-end mb-3">
      <select
        className="form-select w-auto"
        onChange={(e) => setSorting(e.target.value)}
      >
        <option value="">排序方式 ( 預設 ) </option>
        <option value="fee_asc">依價錢低到高</option>
        <option value="fee_desc">依價錢高到低</option>
        <option value="rating_desc">綜合評分最高</option>
        <option value="reviews_desc">最高討論度</option>
      </select>
    </div>
  );
}
