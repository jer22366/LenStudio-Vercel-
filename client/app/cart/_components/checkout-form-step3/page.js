import { useState, useEffect } from "react";
import styles from "./shopping-cart-step3.module.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { isDev, apiURL } from '@/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from "jwt-decode";
import moment from "moment"
import Swal from "sweetalert2";
import { refresh } from "aos";

export default function CheckoutFormStep3() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [paymentMethod, setPaymentMethod] = useState("");
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState({ returnCode: '', returnMessage: '' });
    const [addressData, setAddressData] = useState({
        name: "",
        address: "",
        phone: "",
    });
    const [totalAmount, setTotalAmount] = useState(0);
    const [token, setToken] = useState(null); // 只在瀏覽器端獲取 token
    const [decoded, setDecoded] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("loginWithToken");
            if (storedToken) {
                setToken(storedToken);
                const decodedToken = jwtDecode(storedToken);
                setDecoded(decodedToken.id);
            }
        }
    }, []);

    useEffect(() => {
        const cartData = JSON.parse(localStorage.getItem("cartItems")) || [];
        const cartItems = Object.values(cartData);
        const amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        setTotalAmount(amount);
    }, []);

    useEffect(() => {
        const savedData = localStorage.getItem("buyerData");
        if (savedData) {
            setAddressData(JSON.parse(savedData));
        }
    }, []);

    useEffect(() => {
        if (searchParams?.get('transactionId') && searchParams?.get('orderId')) {
            setLoading(true);
            handleConfirm(searchParams.get('transactionId'));
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const handlePaymentChange = (method) => {
        setPaymentMethod(method);
    };

    const handleSubmit = async () => {
        if (!paymentMethod) {
            toast.error("請選擇付款方式");
            return;
        }

        const cartData = JSON.parse(localStorage.getItem("cartItems")) || [];
        const cartItems = Object.values(cartData);
        const items = cartItems.map(item => `${item.brand || ''} ${item.name} ${item.quantity}`).join(", ");
        const amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        if (paymentMethod === "linePay") {
            goLinePay(amount, items);
        } else if (paymentMethod === "ecpay") {
            goECPay(amount, items);
        }
    };

    const goLinePay = async (amount, items) => {
        const res = await fetch(
            `${apiURL}/linePay/reserve?amount=${amount}&items=${items}`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        );

        const resData = await res.json();
        console.log(resData);

        if (resData.status === 'success') {
            Swal.fire({
                title: "確認付款",
                text: "是否前往 LINE Pay 付款？",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#003150",
                cancelButtonColor: "#CA6D1B",
                confirmButtonText: "確定",
                cancelButtonText: "取消",
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = resData.data.paymentUrl;
                }
            });
        } else {
            toast.error("付款失敗");
        }
    };

    const handleConfirm = async (transactionId) => {
        try {
            const res = await fetch(`${apiURL}/linePay/confirm?transactionId=${transactionId}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            });
            const resData = await res.json();
            console.log(resData);

            if (resData.status === "success") {
                setResult(resData.data);
                await LineInsertDB();
                localStorage.removeItem('cart')
                localStorage.removeItem('rent_cart')
                localStorage.removeItem('shoppingCart')
                localStorage.removeItem('cartItems')
                localStorage.removeItem('buyerData')
                localStorage.removeItem('discountMoney')

                window.dispatchEvent(new Event('cartUpdated'))
                Swal.fire({
                    title: "付款成功",
                    text: "即將跳轉回首頁...",
                    icon: "success",
                    timer: 1500, // 3秒後自動關閉
                    showConfirmButton: false, // 隱藏按鈕
                    allowOutsideClick: false, // 禁止點擊外部關閉
                    allowEscapeKey: false, // 禁止按 ESC 關閉
                    willClose: () => {
                        window.location.href = "/";
                    }
                });

            } else {
                toast.error("付款失敗");
            }


        } catch (error) {
            console.error("確認交易失敗:", error);
            toast.error("交易確認失敗");
            setLoading(false);
        }
    };

    async function LineInsertDB() {

        try {
            let decodedToken;
            if (typeof window !== "undefined") {
                const storedToken = localStorage.getItem("loginWithToken");
                if (storedToken) {
                    decodedToken = jwtDecode(storedToken);

                }
            }
            const orderData = {
                merchantTradeNo: `od${moment().format('YYYYMMDDhhmmss')}`,
                buyerData: JSON.parse(localStorage.getItem("buyerData")) || {},
                cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
                userId: decodedToken.id,
                disMoney: JSON.parse(localStorage.getItem("discountMoney")) || 0
            };

            console.log("送出訂單資料:", orderData);

            const response = await fetch('https://lenstudio.onrender.com/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            console.log(response);
            if (response.status == 200) {
                console.log('訂單已成功存入資料庫');
            } else {
                console.error('存入失敗:', await response.text());
            }
        } catch (error) {
            console.error("資料獲取失敗");
        }
    }

    const goECPay = async (amount, items) => {
        try {
            const res = await fetch(`${apiURL}/${paymentMethod}?amount=${amount}&items=${encodeURIComponent(items)}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            });
            const resData = await res.json();

            if (isDev) console.log(resData);

            if (resData.status === "success") {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = resData.data.action;

                for (const key in resData.data.params) {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = resData.data.params[key];

                    form.appendChild(input);
                }

                document.body.appendChild(form);

                Swal.fire({
                    title: "確認付款",
                    text: `是否前往 ${paymentMethod.toUpperCase()} 付款？`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#003150",
                    cancelButtonColor: "#CA6D1B",
                    confirmButtonText: "確定",
                    cancelButtonText: "取消",
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit();
                    }
                });
            } else {
                toast.error("付款失敗，請稍後再試！");
            }
        } catch (error) {
            console.error("付款請求失敗:", error);
            toast.error("發生錯誤，請稍後再試！");
        }
    };

    return (
        <div className="d-flex flex-column align-items-center align-items-xl-start col-12 col-sm-10 col-md-8 col-lg-8 col-xl-5 col-xxl-5 mt-xl-5 pt-xl-1 ps-0 pe-0 ps-xl-2 pe-xl-3 mt-xl-5">
            <p className={`${styles['j-addressTitle']} text-start ps-3 mb-3`}>結帳</p>

            <div className={`${styles['addressDetail']} d-flex flex-column mb-3 ps-3`}>
                <div className="d-flex mb-3">
                    <span className={styles['j-adDetailtitle']}>送貨方式：</span>
                    <span>標準物流</span>
                </div>
                <div className="d-flex mb-3">
                    <span className={styles['j-adDetailtitle']}>處理時間：</span>
                    <span className={styles['j-adDetailContent']}>
                        2-3個工作天<br /> (將在3-5個工作天送達)<br />
                    </span>
                </div>
                <div className="d-flex mb-3">
                    <span className={styles['j-adDetailtitle']}>送貨地址：</span>
                    <span className={styles['j-adDetailContent']}>
                        {addressData.name} <br />
                        {addressData.address} <br />
                        台灣 ({addressData.phone})<br />
                    </span>
                </div>
            </div>

            <div className={`${styles['j-payStep']} d-flex flex-column`}>
                <div className={styles['j-payTitle']}>付款</div>
                <div className="d-flex justify-content-between w-100 pe-1 py-2">
                    <span >總價：</span>
                    <span className={`${styles['totalAmount']}`}>NT$ {totalAmount.toLocaleString()}</span>
                </div>
                <div className={styles['j-payContent']}>
                    <p className="mb-0">請選擇你的付款方式。之後，您將轉向相關服務頁面已完成你的訂單</p>
                </div>

                <div className={`${styles['j-useCredit']} d-flex flex-column`}>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="ecpay"
                            name="paymentMethod"
                            checked={paymentMethod === "ecpay"}
                            onChange={() => handlePaymentChange("ecpay")}
                        />
                        <p className="ms-2 mb-0">信用卡支付</p>
                    </div>

                    <div className="d-flex align-items-center mt-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="linepay"
                            name="paymentMethod"
                            checked={paymentMethod === "linePay"}
                            onChange={() => handlePaymentChange("linePay")}
                        />
                        <p className="ms-2 mb-0">LinePay</p>
                    </div>
                </div>

                <div className={`${styles['j-Checkout']} d-flex justify-content-center align-items-center`}>
                    <button className={`${styles['j-btn']} btn text-align-center d-flex flex-grow-1 justify-content-center`}
                        onClick={handleSubmit}>
                        付款
                    </button>
                </div>
            </div>
        </div>
    );
}
