import React, { useContext, useEffect, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

import React, { useContext, useEffect, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, inStock, onShowModal }) => {
  const { cartItems, cartVersion, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [localCartItems, setLocalCartItems] = useState(cartItems);

  // Listen for cart clearing events - ULTRA AGGRESSIVE
  useEffect(() => {
    const handleCartCleared = () => {
      console.log("🔄 FoodItem: Cart cleared event received");
      setLocalCartItems({});
      // Force immediate re-render
      setTimeout(() => {
        setLocalCartItems({});
      }, 10);
    };

    // Listen to all possible cart clearing events
    const events = ['cartCleared', 'forceCartReset', 'nuclearCartClear', 'cartReset', 'clearCart', 'cartAnnihilated'];
    events.forEach(eventType => {
      window.addEventListener(eventType, handleCartCleared);
    });

    return () => {
      events.forEach(eventType => {
        window.removeEventListener(eventType, handleCartCleared);
      });
    };
  }, []);

  // Update local cart items when context changes - ENHANCED
  useEffect(() => {
    console.log("🔄 FoodItem: Cart context updated", cartItems);
    setLocalCartItems(cartItems);
  }, [cartItems, cartVersion]);

  if (!id || !name || !image) return null; // Prevent rendering broken items

  return (
    <div className={`food-item ${!inStock ? 'out-of-stock' : ''}`} id={id} key={`${id}-${cartVersion}`} onClick={() => onShowModal({ _id: id, name, price, description, image })}>
      <div className="food-item-img-container">
        {!inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        <img
          className="food-item-image"
          src={`${url}/images/${image}`}
          alt={name}
          onError={(e) => {
            console.log(`Image failed to load: ${e.target.src} for item: ${name}`);
            // Try alternative route if first attempt failed
            if (e.target.src.includes('/images/') && !e.target.src.includes('/api/image/')) {
              e.target.src = e.target.src.replace('/images/', '/api/image/');
            } else if (e.target.src.includes('/api/image/') && !e.target.src.includes('/uploads/')) {
              e.target.src = e.target.src.replace('/api/image/', '/uploads/');
            } else {
              // Use a data URL for a simple placeholder image
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
            }
          }}
          onLoad={(e) => {
            console.log(`Image loaded successfully: ${e.target.src} for item: ${name}`);
          }}
        />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className="food-item-description">{description || "No description available."}</p>
        <p className="food-item-price">₵{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;

