'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCompare } from '@/app/product/_context/CompareContext'
import CartButton from '../cart-button'
import styles from './spec-item.module.scss'

export default function ComponentsCompareItem() {
  const { compareList, addToCompare, removeFromCompare, updateCompare } =
    useCompare()
  const [allProducts, setAllProducts] = useState([]) // 所有商品

  // **獲取所有商品**
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('https://lenstudio.onrender.com/api/product')
        const data = await res.json()
        setAllProducts(data)
      } catch (error) {
        console.error('獲取商品失敗', error)
      }
    }
    fetchProducts()
  }, [])

  // **處理選擇商品**
  const handleSelectChange = (event, index) => {
    const productId = event.target.value
    if (!productId) return

    const selectedProduct = allProducts.find((p) => p.id === Number(productId))

    if (selectedProduct) {
      if (index < compareList.length) {
        // **如果該位置已有商品，替換它**
        updateCompare(index, selectedProduct)
      } else {
        // **如果該位置是空的，則新增**
        addToCompare(selectedProduct)
      }
    }
  }

  return (
    <div>
      <h1 className={styles.compareTitle}>比較相機機型</h1>
      <div className={styles.productContainer}>
        {Array.from({ length: 3 }).map((_, index) => {
          const product = compareList[index] // 取得目前比較的商品
          return (
            <div key={index} className={styles.productBox}>
              {product ? (
                <>
                  <div className={styles.imageTop}>
                    <img src={product.image_url} alt={product.name} />
                  </div>
                  <select
                    className={styles.productSelect}
                    name={`productSelect-${index}`}
                    value={product.id}
                    onChange={(e) => handleSelectChange(e, index)}
                  >
                    <option value={product.id}>{product.name}</option>
                    {allProducts
                      .filter((p) => !compareList.some((c) => c.id === p.id)) // 過濾掉已在比較列表內的商品
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                  <p className={styles.price}>NT${product.price.toLocaleString()}</p>
                  <CartButton product={product} />
                  <button
                    className={`btn btn-link btn-sm ${styles.remove}`}
                    onClick={() => removeFromCompare(product.id)}
                  >
                    移除
                  </button>
                </>
              ) : (
                <Link
                  href="/product"
                  className={`${styles.productBox} ${styles.emptyBox}`}
                >
                  + 添加商品
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
