import React, { useContext, useEffect, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, cartVersion, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [localCartItems, setLocalCartItems] = useState(cartItems);

  // Listen for cart clearing events
  useEffect(() => {
    const handleCartCleared = () => {
      setLocalCartItems({});
    };

    window.addEventListener('cartCleared', handleCartCleared);
    return () => window.removeEventListener('cartCleared', handleCartCleared);
  }, []);

  // Update local cart items when context changes
  useEffect(() => {
    setLocalCartItems(cartItems);
  }, [cartItems, cartVersion]);

  if (!id || !name || !image) return null; // Prevent rendering broken items

  return (
    <div className='food-item' id={id} key={`${id}-${cartVersion}`}>
      <div className="food-item-img-container">
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
        {!localCartItems?.[id] ? (
          <img
            className='add'
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt='Add'
          />
        ) : (
          <div className="food-item-counter">
            <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="Remove" />
            <p>{localCartItems[id]}</p>
            <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="Add" />
          </div>
        )}
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

