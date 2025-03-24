import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from 'jwt-decode';
import moment from "moment";
import Swal from "sweetalert2";
import styles from "./price-summary.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast, ToastContainer } from "react-toastify";

export default function CheckoutFormStep1({ slItem }) {
  const [token, setToken] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [checkState, setCheckState] = useState(false);
  const [cpName, setCpName] = useState("");
  const [couponData, setCouponData] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);

  // **確保在瀏覽器端取得 localStorage**
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("loginWithToken");
      setToken(storedToken);

      if (storedToken) {
        try {
          const decodedToken = jwtDecode(storedToken);
          setDecoded(decodedToken);
        } catch (error) {
          console.error("Token 解析錯誤:", error);
        }
      }
    }
  }, []);

  // **計算原始價格**
  useEffect(() => {
    if (slItem && Array.isArray(slItem)) {
      const itemPrice = slItem.reduce((acc, item) => acc + ((item.price * item.quantity) || 0), 0);
      setPrice(itemPrice);
    }
  }, [slItem]);

  const handleClose = () => {
    setSelectedCoupons([])
    setDiscount(0)
    setCheckState(false);
    setShow(false);
  };

  function handsumbit() {
    setShow(false);
  }

  function handleClick() {
    if (slItem && slItem.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(slItem));
      localStorage.setItem("discountMoney", JSON.stringify(discount));
      setTimeout(() => {
        router.push("/cart/cart-step2");
      }, 100);
    } else {
      Swal.fire({
        icon: "error",
        title: "抱歉",
        text: "購物車內沒有商品，請添加商品後再結帳！",
      });
    }
  }

  async function handleCheck() {
    if (!checkState) {
      setCheckState(true);
      setShow(true);
      await fetchCoupon();
    } else {
      setCheckState(false);
      setCpName("");
      setDiscount(0);
      setSelectedCoupons([]);
    }
  }

  async function fetchCoupon() {
    if (!decoded) return;

    try {
      const response = await fetch(`https://lenstudio.onrender.com/api/coupon?id=${decoded.id}`, {
        method: "GET",
      });

      if (response.status === 200) {
        const data = await response.json();
        setCouponData(data.result);
      } else {
        console.error("獲取失敗:", await response.text());
      }
    } catch (error) {
      console.error("請求錯誤:", error);
    }
  }

  function handleCouponSelect(coupon) {
    let productTotal = 0;
    let lessionTotal = 0;

    if (slItem && Array.isArray(slItem)) {
      slItem.forEach((item) => {
        if (item.type === "product") {
          productTotal += item.price * item.quantity;
        } else if (item.type === "lession") {
          lessionTotal += item.price * item.quantity;
        }
      });
    }

    if (coupon.disType === "fixed" && productTotal < coupon.discount) {
      toast.warning(`此優惠券需購買滿 NT$${coupon.minimum} 的商品（類型: 相機、相機配件）`, {
        autoClose: 1500, // 1.5 秒後自動關閉
      })
      return;
    }

    if (coupon.disType === "percent" && lessionTotal < coupon.discount) {
      toast.warning(`此優惠券需購買滿 NT$${coupon.minimum} 的商品（類型: 課程）`, {
        autoClose: 1500, // 1.5 秒後自動關閉
      })
      return;
    }

    setSelectedCoupons((prevCoupons) => {
      let updatedCoupons = [...prevCoupons];

      const index = updatedCoupons.findIndex((c) => c.code === coupon.code);
      if (index !== -1) {
        updatedCoupons.splice(index, 1);
      } else {
        updatedCoupons.push(coupon);
      }
      localStorage.setItem("selectedCoupons", JSON.stringify(updatedCoupons));
      let totalDiscount = updatedCoupons.reduce((acc, c) => {
        if (c.disType === "fixed") {
          return acc + 1500;
        } else if (c.disType === "percent") {
          return acc + Math.floor((lessionTotal * 5) / 100);
        }
        return acc;
      }, 0);

      setDiscount(Math.min(totalDiscount, price));
      return updatedCoupons;
    });
  }

  const totalPrice = Math.max(price - discount, 0);
  return (

    <div className={`${styles["j-payStep"]} col-sm-11 col-md-9 col-lg-4 col-xl-4 mb-5 ms-lg-0 d-flex flex-column align-items-center`}>
      <div className={`${styles["j-pCount"]} border-bottom mb-3 d-flex flex-column gap-2`}>
        <div className={`${styles["j-pTitle"]} ${styles["j-publicFont"]} ms-lg-3 ms-xl-0`}>摘要</div>
        <div className={`${styles["j-ifCouponUse"]} ${styles["j-publicFont"]} ms-lg-3 ms-xl-0`}>
          <input className={`form-check-input ${styles['j-ckBox']} focus-ring focus-ring-light`} type="checkbox" id="flexCheck" onChange={handleCheck} checked={checkState} />
          <label className="form-check-label mt-1" htmlFor="flexCheck">
            是否使用優惠券
          </label>
        </div>
        <Modal show={show} onHide={handleClose} backdrop="static" size="lg" className={`${styles["j-model"]} mt-5 pt-5`}>
          <Modal.Header closeButton>
            <Modal.Title>選擇優惠券</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-wrap">
              {couponData.length > 0 ? (
                couponData.map((coupon, index) => (
                  <div
                    key={index}
                    className={`${styles["j-cp"]} mb-2 d-flex flex-column align-items-center position-relative col-lg-6
            ${selectedCoupons.some(c => c.code === coupon.code) ? styles["j-selected"] : ""}`}
                    onClick={() => handleCouponSelect(coupon)}
                  >
                    <img src={`/images/cart/${coupon.img}`} alt="" className="img-fluid" />
                    <span className={`position-absolute ${styles["j-cpEndDate"]}`}>
                      {moment(coupon.created_at).add(5, "days").format("YYYY-MM-DD HH:mm:ss")}
                    </span>
                    <span className={`${styles['j-cpName']}`}>{coupon.cpName}</span>
                  </div>
                ))
              ) : (
                <p>沒有可用的優惠券</p>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button className={`${styles['j-btnCancel']}`} onClick={handleClose} >
              關閉
            </Button>
            <Button className={`${styles['j-btnOk']}`} onClick={handsumbit}>
              確定
            </Button>
          </Modal.Footer>
        </Modal>

        <div className={`${styles["couponName"]} d-flex flex-column ms-lg-3 ms-xl-0`}>
          {selectedCoupons.length > 0 ? (
            <span >已選擇優惠券: {selectedCoupons.map(c => c.cpName).join(", ")}</span>
          ) : (
            "未使用優惠券"
          )}
        </div>
        <div className={`${styles["subTotalBox"]} d-flex justify-content-between ${styles["j-publicFont"]} ms-lg-3 ms-xl-0 me-lg-3 me-xl-0`}>
          <div className={styles["subTotal"]}>小計</div>
          <div className={styles["subPrice"]}>NT${Number(price).toLocaleString()}</div>
        </div>
        <div className={`${styles["discountBox"]} d-flex justify-content-between ${styles["j-publicFont"]} ms-lg-3 ms-xl-0 me-lg-3 me-xl-0`}>
          <div className={styles["discount"]}>折扣</div>
          <div className={styles["discountPrice"]}>- NT${Number(discount).toLocaleString()}</div>
        </div>
        <div className={`${styles["totalPriceBox"]} d-flex justify-content-between ${styles["j-publicFont"]} ms-lg-3 ms-xl-0 me-lg-3 me-xl-0`}>
          <div className={styles["total"]}>總額</div>
          <div className={styles["totalPrice"]}>NT${Number(totalPrice).toLocaleString()}</div>
        </div>
      </div>
      <div className={`${styles["j-Checkout"]} d-flex justify-content-center align-items-center align-self-stretch`}>
        <button className={`${styles["j-btn"]} btn text-align-center d-flex flex-grow-1 justify-content-center`} onClick={handleClick}>
          結帳
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} className={`${styles['j-toast']}`} />
    </div>
  );
}
