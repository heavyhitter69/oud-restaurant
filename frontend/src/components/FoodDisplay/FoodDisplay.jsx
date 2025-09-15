import React, { useContext, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import FoodItemModal from '../FoodItemModal/FoodItemModal';

const FoodDisplay = ({ category }) => {
  const { food_list = [] } = useContext(StoreContext);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        <div className="food-display-list">
          {food_list.length === 0 && <p>No food items available.</p>}
          {food_list.map((item, index) => {
            if (!item || (!item._id && !item.name)) return null; // Skip if invalid item
            if (category === 'All' || category === item.category) {
              return (
                <FoodItem
                  key={item._id || index}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  inStock={item.inStock}
                  onItemClick={() => handleItemClick(item)}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
      {selectedItem && <FoodItemModal item={selectedItem} onClose={handleCloseModal} />}
    </>
  );
};

export default FoodDisplay;

