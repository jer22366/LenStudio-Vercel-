import styles from './cart-title.module.scss'
export default function CartTitle({ count }) {
    return (
      <div className={`${styles['j-shoppingCartTitleBox']} d-flex justify-content-center justify-content-lg-start align-items-end pt-5 `}>
        <span className={`${styles['j-shoppingCartTitle']} mt-5`}>我的購物車</span>
        <small className={`${styles['j-small']} ms-1 pb-1`}>({count})</small>
      </div>
    );
  }