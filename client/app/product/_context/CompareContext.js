"use client";
import Header from "@/app/header";
import { createContext, useContext, useState, useEffect } from "react";

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const updateCompare = async (index, newProduct) => {
    if (!newProduct || !newProduct.id) return;

    // 先獲取新的商品規格
    const productWithSpec = await fetchProductSpec(newProduct);

    setCompareList((prevList) => {
      const newList = [...prevList];
      newList[index] = productWithSpec;
      localStorage.setItem("compareList", JSON.stringify(newList));
      return newList;
    });
  };

  const [compareList, setCompareList] = useState([]);

  // 確保 `localStorage` 讀取後仍然是陣列
  useEffect(() => {
    const storedCompareList = JSON.parse(localStorage.getItem("compareList")) || [];
    setCompareList(Array.isArray(storedCompareList) ? storedCompareList : []);
  }, []);

  const fetchProductSpec = async (product) => {
    try {
      const response = await fetch(`https://lenstudio.onrender.com/api/product/spec/${product.id}`);
      if (!response.ok) throw new Error("HTTP 錯誤 " + response.status);
      const data = await response.json();
      return { ...product, specs: data };
    } catch (error) {
      console.error("獲取商品規格時發生錯誤:", error);
      return { ...product, specs: {} };
    }
  };

  const addToCompare = async (product) => {
    if (!product || !product.id) return;

    const prevList = JSON.parse(localStorage.getItem("compareList")) || [];

    if (!Array.isArray(prevList)) {
      console.error("`compareList` 不是陣列，初始化為空陣列");
      return;
    }

    if (prevList.length >= 3) {
      alert("最多只能比較 3 項商品！");
      return;
    }

    // 先獲取商品規格
    const productWithSpec = await fetchProductSpec(product);

    // 更新狀態與 localStorage
    const newList = [...prevList, productWithSpec];
    setCompareList(newList);
    localStorage.setItem("compareList", JSON.stringify(newList));
  };

  const removeFromCompare = (productId) => {
    setCompareList((prevList) => {
      if (!Array.isArray(prevList)) {
        console.error("`compareList` 不是陣列，初始化為空陣列");
        return [];
      }
      const newList = prevList.filter((p) => p.id !== productId);
      localStorage.setItem("compareList", JSON.stringify(newList));
      return newList;
    });

    console.log(`已移除商品 (ID: ${productId})`);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, updateCompare }}>
      <Header />
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
