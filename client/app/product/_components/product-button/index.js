'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useCompare } from '@/app/product/_context/CompareContext'
import styles from './product-button.module.scss'
import { toast } from 'react-toastify'
import { MdRemoveCircle, MdCompare, MdErrorOutline } from 'react-icons/md'

export default function CompareButton({ product, isHovered }) {
  const { compareList, addToCompare, removeFromCompare } = useCompare()
  const isInCompareList = compareList.some((p) => p.id === product.id)

  const handleCompareClick = () => {
    if (isInCompareList) {
      removeFromCompare(product.id)
      toast.info(`${product.name} 已從比較清單中移除！`, {
        position: 'top-right',
        autoClose: 1500,
        icon: <MdRemoveCircle size={30} color="gray" />,
        className: styles.toastCustom,
      })
    } else {
      if (compareList.length >= 3) {
        toast.warn('最多只能比較 3 項商品！', {
          position: 'top-center',
          autoClose: 2000,
          icon: <MdErrorOutline size={30} color="orange" />,
        })
      } else {
        addToCompare(product)
        toast.success(`${product.name} 已加入比較！`, {
          position: 'top-right',
          autoClose: 1500,
          icon: <MdCompare size={30} color="blue" />,
          className: styles.toastCustom,
        })
      }
    }
  }

  return (
    <div
      className={`${styles.iconcontainer} ${
        isHovered ? styles.show : styles.hide
      }`}
    >
      <div
        className={`${styles.iconCircle} ${
          isInCompareList ? styles.added : ''
        }`}
        onClick={handleCompareClick}
      >
        <FontAwesomeIcon
          icon={isInCompareList ? faCheck : faCamera}
          className={styles.icon}
        />
      </div>
      <p className={styles.iconText}>{isInCompareList ? '加入' : '比較'}</p>
    </div>
  )
}
