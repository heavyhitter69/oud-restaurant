import React, { useContext, useState, useEffect } from 'react';
import './FoodItemModal.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItemModal = ({ item, onClose }) => {
  if (!item) return null;

  const { addToCart, url } = useContext(StoreContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [totalPrice, setTotalPrice] = useState(item.price);

  useEffect(() => {
    const initialCustomizations = {};
    if (item.customizations) {
      item.customizations.forEach(c => {
        if (c.options.length > 0) {
          initialCustomizations[c.name] = c.options[0].name;
        }
      });
    }
    setSelectedCustomizations(initialCustomizations);
  }, [item]);

  useEffect(() => {
    let price = item.price;
    if (item.customizations) {
      for (const customizationName in selectedCustomizations) {
        const customization = item.customizations.find(c => c.name === customizationName);
        if (customization) {
          const selectedOption = customization.options.find(o => o.name === selectedCustomizations[customizationName]);
          if (selectedOption) {
            price += selectedOption.price;
          }
        }
      }
    }
    setTotalPrice(price * quantity);
  }, [selectedCustomizations, quantity, item]);

  const handleCustomizationChange = (customizationName, optionName) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [customizationName]: optionName
    }));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item._id, selectedCustomizations);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.name}</h2>
          <img src={assets.cross_icon} alt="Close" onClick={onClose} className="modal-close-icon" />
        </div>
        <div className="modal-body">
          <img src={`${url}/images/${item.image}`} alt={item.name} className="modal-image" />
          <p className="modal-description">{item.description}</p>
          {item.customizations && item.customizations.map((customization, index) => (
            <div key={index} className="customization-section">
              <h3>{customization.name}</h3>
              <select onChange={(e) => handleCustomizationChange(customization.name, e.target.value)}>
                {customization.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option.name}>
                    {option.name} (+₵{option.price})
                  </option>
                ))}
              </select>
            </div>
          ))}
          <p className="modal-price">₵{totalPrice.toFixed(2)}</p>
        </div>
        <div className="modal-footer">
          <div className="quantity-control">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button onClick={handleAddToCart} className="add-to-cart-btn">
            Add {quantity} to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;
