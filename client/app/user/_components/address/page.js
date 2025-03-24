import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { MdEdit, MdDelete } from "react-icons/md";
import { renderToString } from "react-dom/server";
import styles from "./address.module.scss";

const MySwal = withReactContent(Swal);

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const token = localStorage.getItem("loginWithToken");

  // **獲取所有住址**
  const fetchAddresses = async () => {
    if (!token) {
      Swal.fire("錯誤", "請先登入", "error");
      return [];
    }

    try {
      const response = await fetch("https://lenstudio.onrender.com/api/users/addresses/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.status === "success" && result.data) {
        setAddresses(result.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("❌ 獲取住址失敗:", error);
      setAddresses([]);
    }
  };

  // **當組件載入時，抓取住址**
  useEffect(() => {
    fetchAddresses();
  }, []);

  // **編輯住址**
  const handleEditAddress = async (addressId) => {
    const currentAddress = addresses.find((a) => a.id === addressId)?.address || "";

    const { value: newAddress } = await MySwal.fire({
      title: "編輯住址",
      input: "text",
      inputValue: currentAddress,
      showCancelButton: true,
      confirmButtonText: "更新",
      cancelButtonText: "取消",
      confirmButtonColor: "#143146",
      cancelButtonColor: "#d0b088",
      inputValidator: (value) => {
        if (!value) return "住址不能為空";
      },
    });

    if (newAddress && newAddress !== currentAddress) {
      try {
        const response = await fetch(`https://lenstudio.onrender.com/api/users/addresses/${addressId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ address: newAddress }),
        });

        const result = await response.json();
        if (result.status === "success") {
          await fetchAddresses(); // **確保即時刷新**
          Swal.fire("成功", "住址已更新", "success");
        } else {
          Swal.fire("錯誤", result.message || "無法更新住址", "error");
        }
      } catch (error) {
        Swal.fire("錯誤", "伺服器錯誤，請稍後再試", "error");
      }
    }
  };

  // **刪除住址**
  const handleDeleteAddress = async (addressId) => {
    const { isConfirmed } = await MySwal.fire({
      title: "確認刪除",
      text: "您確定要刪除此住址嗎？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
      confirmButtonColor: "#143146",
      cancelButtonColor: "#d0b088",
    });

    if (isConfirmed) {
      try {
        const response = await fetch(`https://lenstudio.onrender.com/api/users/addresses/${addressId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (result.status === "success") {
          await fetchAddresses(); // **確保即時刷新**
          Swal.fire("成功", "住址已刪除", "success");
        } else {
          Swal.fire("錯誤", result.message || "無法刪除住址", "error");
        }
      } catch (error) {
        Swal.fire("錯誤", "伺服器錯誤，請稍後再試", "error");
      }
    }
  };

  // **新增/管理住址**
  const handleAddAddress = async () => {
    await fetchAddresses(); // **確保最新資料已獲取**

    const { value: address } = await MySwal.fire({
      title: "新增住址",
      input: "text",
      inputPlaceholder: "請輸入新住址...",
      showCancelButton: true,
      confirmButtonText: "新增",
      cancelButtonText: "取消",
      confirmButtonColor: "#143146",
      cancelButtonColor: "#d0b088",
      inputValidator: (value) => {
        if (!value) return "住址不能為空";
      },
    });

    if (address) {
      try {
        const response = await fetch("https://lenstudio.onrender.com/api/users/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ address }),
        });

        const result = await response.json();

        if (result.status === "success") {
          await fetchAddresses(); // **確保即時刷新**
          Swal.fire("成功", "住址已添加", "success");

        } else {
          Swal.fire("錯誤", result.message || "無法添加住址", "error");
        }
      } catch (error) {
        Swal.fire("錯誤", "伺服器錯誤，請稍後再試", "error");
      }
    }
  };

  return (
    <div>
      <h4>我的地址</h4>
      <strong className="text-muted">送貨地址:</strong>
      <div className={`card p-3 mt-3 ${styles.address}`}>
        {addresses.length > 0 ? (
          <ul className="mt-2">
            {addresses.map((address) => (
              <li key={address.id} className="list-group-item d-flex justify-content-between align-items-center mb-2">
                {address.address}
                <div>
                  <a onClick={() => handleEditAddress(address.id)} className={`me-2 ${styles.put}`}>
                    <MdEdit />
                  </a>
                  <a onClick={() => handleDeleteAddress(address.id)} className={`btn-outline-danger ${styles.put}`}>
                    <MdDelete />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">尚未填寫住址</p>
        )}
      </div>
      <a onClick={handleAddAddress} className={`btn mt-3 ${styles.AddAddress}`}>
        新增住址
      </a>
    </div>
  );
};

export default AddressManager;
