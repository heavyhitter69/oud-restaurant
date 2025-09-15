import React, { useContext, useState } from 'react';
import './FoodDetailModal.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

const FoodDetailModal = ({ food, onClose }) => {
  const { addToCart, url } = useContext(StoreContext);
  const [spiceLevel, setSpiceLevel] = useState('Mild');
  const [addProtein, setAddProtein] = useState(false);

  if (!food) {
    return null;
  }

  const handleAddToCart = () => {
    const item = {
      ...food,
      spiceLevel,
      addProtein,
    };
    addToCart(item);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{food.name}</h2>
          <img src={assets.cross_icon} alt="Close" onClick={onClose} className="modal-close-icon" />
        </div>
        <div className="modal-body">
          <img src={`${url}/images/${food.image}`} alt={food.name} className="modal-food-image" />
          <p className="food-item-description">{food.description}</p>
          <div className="customization-options">
            <div className="option-group">
              <label htmlFor="spice-level">Spice Level:</label>
              <select id="spice-level" value={spiceLevel} onChange={(e) => setSpiceLevel(e.target.value)}>
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
              </select>
            </div>
            <div className="option-group">
              <label htmlFor="add-protein">
                <input
                  type="checkbox"
                  id="add-protein"
                  checked={addProtein}
                  onChange={(e) => setAddProtein(e.target.checked)}
                />
                Add extra protein (+₵5)
              </label>
            </div>
          </div>
          <p className="food-item-price">₵{price}</p>
        </div>
        <div className="modal-footer">
          <button onClick={handleAddToCart} className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
