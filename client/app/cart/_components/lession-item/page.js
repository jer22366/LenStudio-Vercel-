import Swal from "sweetalert2";
import styles from "./lession-item.module.scss";

export default function LessonItem({ lessionitem, page, length, id }) {
    const { image, name, price } = lessionitem;
    id = id - length
    function handleDeleteItem() {
        Swal.fire({
            title: "確定要刪除嗎？",
            text: "刪除後將無法恢復此商品！",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#CA6D1B",
            cancelButtonColor: "#003150",
            confirmButtonText: "刪除",
            cancelButtonText: "取消",
        }).then((result) => {
            if (result.isConfirmed) {
                // 取得 localStorage 中的購物車數據
                let cart = JSON.parse(localStorage.getItem("shoppingCart")) || {};

                delete cart[id];
                let updatedCart = Object.entries(cart).filter(v => v != null); // 過濾掉該商品
                updatedCart = updatedCart.map(v => v[1]);

                console.log(updatedCart);
                localStorage.removeItem("shoppingCart");
                localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));

                // 顯示刪除成功提示
                Swal.fire({
                    title: "已刪除！",
                    text: "商品已從購物車移除。",
                    icon: "success",
                    confirmButtonText: "確定",
                }).then(() => {
                    // 刷新頁面或通知父層更新購物車
                    window.location.reload();
                });
            }
        });
    }
    return (
        <>
            <div className="d-none d-sm-block d-flex flex-grow-1">
                <div className={`${styles['j-cartItemBox']} d-flex flex-grow-1 justify-content-between position-relative`}>
                    <div className={"d-flex flex-grow-1"}>
                        <div className={`${styles['j-lessonImg']} mt-2 d-flex ms-2 me-2 me-xxl-4`}>
                            <img src={image} alt={name} className={` object-fit-contain`} />
                        </div>
                        <div className="d-flex align-items-center flex-lg-row flex-grow-1">
                            <div >
                                <span className={`${styles['j-lsTitle']} ms-sm-3 me-sm-2 ms-xxl-0 me-xxl-0`}>
                                    {name}
                                </span>
                            </div>
                            <div className="d-flex flex-grow-1 justify-content-center  ps-lg-0 ps-xxl-2">
                                <p className={`ps-xxl-4 ps-lg-2 ms-lg-1 ms-xxl-1 mt-2 mb-2 me-md-2 ${styles['j-lsText']}`}>NT$ {Number(price).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    {page ? <div className={`${styles['j-delBtn']} position-absolute`}>
                        <button className="btn" onClick={handleDeleteItem}>
                            ✕
                        </button>
                    </div> : ''}
                </div>
            </div>
            <div className="d-sm-none d-block d-flex flex-grow-1">
                <div className={`${styles['j-cartItemBox']} d-flex flex-grow-1 justify-content-between position-relative`}>
                    <div className={"d-flex flex-grow-1"}>
                        <div className={`${styles['j-lessonImg']} mt-2 d-flex ms-2 me-2 me-xxl-4`}>
                            <img src={image} alt={name} className={` object-fit-contain`} />
                        </div>
                        <div className="d-flex flex-column align-items-center flex-grow-1  justify-content-center">
                            <div >
                                <span className={`${styles['j-lsTitle']} mt-2 ms-3 me-2`}>
                                    {name}
                                </span>
                            </div>
                            <div className="d-flex justify-content-center ps-md-4 ps-lg-5 ms-xxl-4 me-3 pe-3">
                                <p className={`ps-xxl-4 ms-xxl-2 ms-1 mt-2 ${styles['j-lsText']}`}>NT$ {Number(price).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    {page ? <div className={`${styles['j-delBtn']} position-absolute`}>
                        <button className="btn" onClick={handleDeleteItem}>
                            ✕
                        </button>
                    </div> : ''}
                </div>
            </div>
        </>

    );
}