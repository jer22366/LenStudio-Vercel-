"use client";

import { useEffect, useState } from "react";
import ProductCard from "../product-card";
import Pagination from "../product-pagination";
import styles from "./product-list.module.scss";

export default function ProductList({ filters, sort }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchProducts() {
      try {
        let url = "https://lenstudio.onrender.com/api/product";
        const query = new URLSearchParams();

        if (filters.brand_id.length) query.append("brand_id", filters.brand_id.join(","));
        if (filters.category_id.length) query.append("category_id", filters.category_id.join(","));
        if (filters.subcategory_id.length) query.append("subcategory_id", filters.subcategory_id.join(","));
        if (filters.min_price) query.append("min_price", filters.min_price);
        if (filters.max_price) query.append("max_price", filters.max_price);
        if (filters.sort) query.append("sort", filters.sort);

        if (query.toString()) {
          url += "?" + query.toString();
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP 錯誤 " + res.status);

        const data = await res.json();
        setProducts(data);
        setCurrentPage(1);
      } catch (error) {
        console.error("獲取商品時發生錯誤:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters, sort]);

  if (loading) return <p className={styles.loadingText}>載入中...</p>;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div>
      <div className={`row ${styles.productList}`}>
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className={styles.noProductText}>金額輸入錯誤</p>
        )}
      </div>
      {totalPages > 1 && (
        <div className={`container ${styles.container}`}>
          <Pagination totalProducts={products.length} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
