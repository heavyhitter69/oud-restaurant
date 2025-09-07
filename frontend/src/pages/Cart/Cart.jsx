import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {


  const { 
    cartItems, 
    food_list, 
    removeFromCart, 
    getTotalCartAmount, 
    getDiscountAmount,
    getFinalTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    url,
    token,
    setShowLogin
  } = useContext(StoreContext);

  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const navigate = useNavigate();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage('Please enter a promo code');
      return;
    }

    // Check if already applied
    if (appliedPromo && appliedPromo.code === promoCode.trim().toUpperCase()) {
      setPromoMessage('This promo code is already applied!');
      return;
    }

    setIsApplyingPromo(true);
    setPromoMessage('');

    const result = await applyPromoCode(promoCode.trim());
    
    if (result.success) {
      setPromoMessage(result.message);
      setPromoCode('');
    } else {
      setPromoMessage(result.message);
    }
    
    setIsApplyingPromo(false);
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoMessage('');
  };

  return (
    <div className='cart'>
      <div className="cart-header">
        <h1>Your Cart</h1>
        <p>Review your items and proceed to checkout</p>
      </div>
      
      {Object.keys(cartItems).length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            <div className="cart-items-title">
              <p>Items</p>
              <p>Title</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>
            </div>
            <br />
            <hr />
            {food_list.map((item, index) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id} className='cart-items-item'>
                    <img src={url+"/images/"+item.image} alt="" />
                    <p>{item.name}</p>
                    <p>₵{item.price}</p>
                    <p>{cartItems[item._id]}</p>
                    <p>₵{item.price * cartItems[item._id]}</p>
                    <div onClick={()=>removeFromCart(item._id)} className='cross'>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                      </svg>
                    </div>
                  </div>
                )
              }
            })}
          </div>
                <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Total</h2>
              <div>
                <div className="cart-total-details">
                  <p>Subtotal</p>
                  <p>₵{getTotalCartAmount()}</p>
                </div>
                {appliedPromo && (
                  <div className="cart-total-details discount">
                    <p>Discount ({appliedPromo.discountPercentage}%)</p>
                    <p>-₵{getDiscountAmount()}</p>
                  </div>
                )}
                <div className="cart-total-details">
                  <p>Delivery fee</p>
                  <p>₵{getTotalCartAmount()===0?0:5}</p>
                </div>
                <div className="cart-total-details total">
                  <p>Total</p>
                  <p>₵{getTotalCartAmount()===0?0:getFinalTotal()+5}</p>
                </div>
              </div>
              <button onClick={() => {
                if (!token) {
                  toast.error('Please login or create an account first to place an order');
                  setShowLogin(true);
                } else {
                  navigate('/order');
                }
              }}>PROCEED TO CHECKOUT</button>
            </div>
        <div className="cart-promocode">
          <div className="promo-header">
            <h3>Promo Code</h3>
            <div className="promo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14l6-6"/>
                <circle cx="15.5" cy="8.5" r=".5"/>
                <circle cx="8.5" cy="15.5" r=".5"/>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 3,6 7,2"/>
                <polyline points="17,14 21,18 17,22"/>
              </svg>
            </div>
          </div>
          <p className="promo-description">Enter your promo code to get a discount on your order</p>
          
          {appliedPromo && (
            <div className="applied-promo">
              <div className="applied-promo-info">
                <div className="promo-badge">
                  <span className="promo-code">{appliedPromo.code}</span>
                  <span className="promo-discount">{appliedPromo.discountPercentage}% OFF</span>
                </div>
                <p className="promo-savings">You save ₵{getDiscountAmount().toFixed(2)}</p>
              </div>
              <button onClick={handleRemovePromo} className="remove-promo-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}
          
          <div className='cart-promocode-input'>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder='Enter promo code' 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                disabled={appliedPromo}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 14l6-6"/>
                  <circle cx="15.5" cy="8.5" r=".5"/>
                  <circle cx="8.5" cy="15.5" r=".5"/>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 3,6 7,2"/>
                  <polyline points="17,14 21,18 17,22"/>
                </svg>
              </div>
            </div>
            <button 
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || appliedPromo || !promoCode.trim()}
              className="apply-promo-btn"
            >
              {isApplyingPromo ? (
                <div className="loading-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                </div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {promoMessage && (
            <div className={`promo-message ${promoMessage.includes('successfully') ? 'success' : 'error'}`}>
              <div className="message-icon">
                {promoMessage.includes('successfully') ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                )}
              </div>
              <span>{promoMessage}</span>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default Cart
