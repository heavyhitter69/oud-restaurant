import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  console.log("PlaceOrder component rendered");

  const { 
    getTotalCartAmount, 
    getDiscountAmount,
    getFinalTotal,
    appliedPromo,
    token, 
    userData,
    food_list, 
    cartItems, 
    url,
    clearCart,
    setCartItems
  } = useContext(StoreContext)

  const [data, setData] = useState({
    name: "",
    email: "",
    location: "",
    phone: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)

  const onChangeHandler = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    
    // Format phone number for Ghanaian numbers
    if (name === 'phone') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      
      // If it starts with 233, format it
      if (digits.startsWith('233') && digits.length <= 12) {
        const remaining = digits.slice(3);
        if (remaining.length <= 9) {
          value = `+233 ${remaining.slice(0, 2)} ${remaining.slice(2, 5)} ${remaining.slice(5)}`;
        }
      } else if (digits.length <= 9) {
        // If it's just the 9 digits, add +233
        value = `+233 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
      }
      
      // Limit to 9 digits after +233
      const phoneDigits = value.replace(/\D/g, '').slice(3);
      if (phoneDigits.length > 9) {
        return; // Don't update if more than 9 digits
      }
    }
    
    // Email validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com)$/i;
      if (value && !emailRegex.test(value)) {
        // Show warning but don't prevent typing
        const emailInput = event.target;
        emailInput.style.borderColor = '#ff6b6b';
        emailInput.title = 'Please use a valid email address (@gmail.com, @yahoo.com, or @outlook.com)';
      } else {
        const emailInput = event.target;
        emailInput.style.borderColor = '';
        emailInput.title = '';
      }
    }
    
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com)$/i;
    if (!emailRegex.test(data.email)) {
      toast.error('Please use a valid email address (@gmail.com, @yahoo.com, or @outlook.com)');
      return;
    }
    
    // Validate phone number (should have exactly 9 digits after +233)
    const phoneDigits = data.phone.replace(/\D/g, '').slice(3);
    if (phoneDigits.length !== 9) {
      toast.error('Please enter a valid Ghanaian phone number (9 digits after +233)');
      return;
    }
    
    setIsLoading(true);
    
    let orderItems = [];
    food_list.map((item)=>{
      if (cartItems[item._id]>0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo)
      }
    })
    let orderData = {
      address:data,
      items:orderItems,
      amount:getFinalTotal()+5,
      promoCode: appliedPromo ? appliedPromo.code : null
    }
    try {
      let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}});
      if (response.data.success) {
        const {authorization_url} = response.data;
        
        // Save cart data before clearing (for failed payment restoration)
        const cartDataToRestore = { ...cartItems };
        localStorage.setItem("cartDataToRestore", JSON.stringify(cartDataToRestore));
        
        // Clear cart when proceeding to payment (reserve items)
        console.log("Clearing cart before proceeding to payment...");
        await clearCart();
        
        // Keep loading state until redirect happens
        setTimeout(() => {
          window.location.replace(authorization_url);
        }, 1000);
      }
      else {
        setIsLoading(false);
        toast.error("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      setIsLoading(false);
      toast.error("Error placing order: " + (error.response?.data?.message || error.message));
    }
  }
  const navigate = useNavigate();

    useEffect(()=>{
      if (!token) {
        navigate('/cart')
      }
      else if (getTotalCartAmount()===0) {
        navigate('/cart')
      }
    },[token, navigate, getTotalCartAmount])

    // Auto-fill form with cached user data
    useEffect(() => {
      console.log("PlaceOrder useEffect triggered");
      console.log("Current token:", token);
      console.log("Cached user data:", userData);
      
      if (userData && token) {
        // Auto-fill the form with cached user data (instant)
        setIsAutoFilling(true);
        setData(prevData => ({
          ...prevData,
          name: userData.name || "",
          email: userData.email || ""
        }));
        console.log("Auto-filled form with cached user data:", userData);
        setIsAutoFilling(false);
      } else if (token && !userData) {
        // Fallback: fetch user data if not cached
        const fetchUserData = async () => {
          setIsAutoFilling(true);
          try {
            console.log("Fetching user profile data...");
            const response = await axios.post(url + "/api/user/profile", {}, {
              headers: { token }
            });
            console.log("User profile response:", response.data);
            
            if (response.data.success) {
              // Auto-fill the form with user data
              setData(prevData => ({
                ...prevData,
                name: response.data.data.name || "",
                email: response.data.data.email || ""
              }));
              console.log("Auto-filled form with fetched user data:", response.data.data);
            } else {
              console.error("Failed to fetch user data:", response.data.message);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            console.error("Error response:", error.response?.data);
          } finally {
            setIsAutoFilling(false);
          }
        };
        
        fetchUserData();
      } else {
        console.log("No token or user data available");
      }
    }, [token, userData, url]);


  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-header">
        <h1>Complete Your Order</h1>
        <p>Please provide your delivery information to proceed</p>
      </div>
      
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        {isAutoFilling && (
          <div className="auto-fill-indicator">
            <span>🔄 Auto-filling your information...</span>
          </div>
        )}
        <input required name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Full Name' />
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email Address (for receipt)' />
        <input required name='location' onChange={onChangeHandler} value={data.location} type="text" placeholder='Delivery Location' />
        <input 
          required 
          name='phone' 
          onChange={onChangeHandler} 
          value={data.phone} 
          type="tel" 
          placeholder='Enter your phone number (e.g., 0241234567)' 
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₵{getTotalCartAmount()}</p>
            </div>
            <hr />
            {appliedPromo && (
              <>
                <div className="cart-total-details discount">
                  <p>Discount ({appliedPromo.discountPercentage}%)</p>
                  <p>-₵{getDiscountAmount()}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>₵{getTotalCartAmount() === 0 ? 0 : 5}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₵{getTotalCartAmount() === 0 ? 0 : getFinalTotal() + 5}</b>
            </div>
          </div>
          <button type='submit' disabled={isLoading} className={isLoading ? 'loading' : ''}>
            {isLoading ? (
              <>
                <div className="button-spinner"></div>
                Processing Payment...
              </>
            ) : (
              'PROCEED TO PAYMENT'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;
