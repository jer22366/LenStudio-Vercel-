'use client'

import styles from './cart-step3.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import CartItem from '../_components/cart-item/page';
import LessonItem from '../_components/lession-item/page';
import RentItem from '../_components/rental-item/page';
import CheckoutFormStep3 from '../_components/checkout-form-step3/page';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';


export default function cartPageThree() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartEmpty, setIsCartEmpty] = useState(false)
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
    if (typeof window !== "undefined") {
      const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(storedCartItems);
    }
  }, []);

  const cartProduct = []
  const cartLession = []
  const cartRent = []

  let test = cartItems
  Object.values(test).map(v => {
    switch (v.type) {
      case 'product':
        cartProduct.push(v);
        break;
      case 'lession':
        cartLession.push(v);
        break;
      case 'rent':
        cartRent.push(v);
        break;
    }
  })
  if (isCartEmpty) {
    router.push('/cart/cart-empty')
    return null
  }
  return (
    <div className={`${styles['j-page-wrapper']}`}>
      {isCartEmpty ? redirect('/cart/cart-empty') :
        <div className="container">
          <div className={`${styles['j-heightspace']}`}></div>
          <div className="row d-flex justify-content-center">
            <div className={`${styles['j-shoppingCartBox']} justify-content-center col col-sm-10 col-md-9 col-lg-7 col-xl-5 col-xxl-5 ps-0 pe-0 ps-xl-2 pe-xl-3`}>
              <div className={`${styles['j-cartItemsBox']} d-none d-sm-block p-0 d-flex flex-grow-1 flex-column gap-3`}>
                <div className={`mt-2 mb-sm-5 ${styles['j-itemBox']}`}>
                  {cartProduct.length != 0 ? <h3 className={`${styles['j-cartTitle']} mb-0 ps-3 pt-2 pb-2`}>相機</h3> : ''}
                  {cartProduct.map((item, index) => (
                    <div
                      className={`${styles['j-input-box']} d-flex align-items-center mb-3 ${index > 0 ? styles['j-nextBox'] : ""}`}
                      key={index}>
                      <CartItem key={index} id={index + 1} itemData={item} />
                    </div>
                  ))}
                </div>

                <div className={`mt-2 mb-5 ${styles['j-itemBox']}`}>
                  {cartLession.length != 0 ? <h3 className={`${styles['j-cartTitle']} mb-0 ps-3 pt-2 pb-2`}>課程</h3> : ''}
                  {cartLession.map((lession, index) => (
                    <div key={index}
                      className={`${styles['j-input-box']} d-flex align-items-center mb-3 ${index > 0 ? styles['j-nextBox'] : ""}`}>
                      <LessonItem key={index} lessionitem={lession} />
                    </div>
                  ))}
                </div>

                <div className={`mt-2 mb-5 ${styles['j-itemBox']}`}>
                  {cartRent.length != 0 ? <h3 className={`${styles['j-cartTitle']} mb-0 ps-3 pt-2 pb-2`}>租借</h3> : ''}
                  {cartRent.map((rental, index) => (
                    <div key={index}
                      className={`${styles['j-input-box']} d-flex align-items-center mb-3 ${index > 0 ? styles['j-nextBox'] : ""}`}>
                      <RentItem key={index} rentalitem={rental} />
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${styles['j-cartItemsBox']} d-sm-none d-block p-0 d-flex flex-grow-1 flex-column gap-3`}>
                {cartProduct.length == 0 ? '' :
                  <div className="mt-2">
                    {cartProduct.length != 0 ? <h3 className={`${styles['j-cartTitle']} mb-0 ps-3 pt-2 pb-2`}>相機</h3> : ''}
                    {cartProduct.map((item, index) => (
                      <div
                        className={`${styles['j-input-box']} d-flex align-items-center mb-3 ${index > 0 ? styles['j-nextBox'] : ""}`}
                        key={index}
                      >
                        <CartItem key={index} id={index} itemData={item} />
                      </div>
                    ))}
                  </div>}

                {cartLession.length == 0 ? '' :
                  <div className="mt-2">
                    {cartLession.length != 0 ? <h3 className={`${styles['j-cartTitle']} mb-0 ps-3 pt-2 pb-2`}>課程</h3> : ''}
                    {cartLession.map((lession, index) => {
                      const lessonIndex = index + cartProduct.length
                      return (
                        <div
                          className={`${styles['j-input-box']} d-flex align-items-center mb-3 ${index > 0 ? styles['j-nextBox'] : ""}`}
                          key={index}>
                          <LessonItem key={index} id={lessonIndex} lessionitem={lession} length={cartProduct.length} />
                        </div>
                      )
                    })}
                  </div>}

                {cartRent.length == 0 ? '' :
                  <div className="mt-2">
                    {cartRent.length != 0 ? <h3 className={`${styles['j-cartTitle']} mb-0 ps-3 pt-2 pb-2`}>租借</h3> : ''}
                    {cartRent.map((rental, index) => {
                      const rentalIndex =
                        index + cartProduct.length + cartLession.length
                      return (
                        <div
                          className={`${styles['j-input-box']} d-flex align-items-center mb-3 ${index > 0 ? styles['j-nextBox'] : ""}`}
                          key={index}>
                          <RentItem key={index} rentalitem={rental} id={rentalIndex} length={(cartProduct.length + cartLession.length)} />
                        </div>
                      )
                    })}
                  </div>}
              </div>
            </div>
            <CheckoutFormStep3 />
          </div>
        </div>
      }
    </div>
  )
}
