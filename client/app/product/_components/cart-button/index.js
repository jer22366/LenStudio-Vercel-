'use client'
import styles from './cart-button.module.scss'
import { toast } from 'react-toastify'
import { MdError, MdShoppingCart } from 'react-icons/md'

export default function CartButton({ product }) {
  const addToCart = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('loginWithToken')
        : null

    if (!token) {
      toast.error('請先登入才能加入購物車！', {
        position: 'top-right',
        autoClose: 2000,
        icon: <MdError size={30} />,
      })
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || []
    const exists = cart.find((item) => item.id === product.id)

    if (exists) {
      // 商品已經在購物車中，顯示提示
      toast.warning(`${product.name} 已在購物車`, {
        position: 'top-right',
        autoClose: 2000,
        icon: <MdError size={30} color="orange" />,
        className: styles.toastCustom,
      })
      return
    }

    // 如果商品不在購物車中，則新增
    cart.push({ ...product, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // ✅ 觸發購物車更新
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success(`${product.name} 已加入購物車`, {
      position: 'top-right',
      autoClose: 1500,
      icon: <MdShoppingCart size={30} color="green" />,
      className: styles.toastCustom,
    })
  }

  return (
    <button
      className={styles.cartButton}
      onClick={(e) => {
        e.stopPropagation()
        addToCart()
      }}
    >
      加入購物車
    </button>
  )
}
