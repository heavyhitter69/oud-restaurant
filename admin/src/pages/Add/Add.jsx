import React, { useState } from 'react';
import './Add.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
  });
  const [customizations, setCustomizations] = useState([]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((data) => ({ ...data, [name]: value }));
  };

  const handleCustomizationChange = (index, event) => {
    const newCustomizations = [...customizations];
    newCustomizations[index][event.target.name] = event.target.value;
    setCustomizations(newCustomizations);
  };

  const addCustomization = () => {
    setCustomizations([...customizations, { name: '', options: [] }]);
  };

  const removeCustomization = (index) => {
    const newCustomizations = [...customizations];
    newCustomizations.splice(index, 1);
    setCustomizations(newCustomizations);
  };

  const handleOptionChange = (customizationIndex, optionIndex, event) => {
    const newCustomizations = [...customizations];
    newCustomizations[customizationIndex].options[optionIndex][event.target.name] = event.target.value;
    setCustomizations(newCustomizations);
  };

  const addOption = (customizationIndex) => {
    const newCustomizations = [...customizations];
    newCustomizations[customizationIndex].options.push({ name: '', price: '' });
    setCustomizations(newCustomizations);
  };

  const removeOption = (customizationIndex, optionIndex) => {
    const newCustomizations = [...customizations];
    newCustomizations[customizationIndex].options.splice(optionIndex, 1);
    setCustomizations(newCustomizations);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', Number(data.price));
    formData.append('category', data.category);
    formData.append('image', image);
    formData.append('customizations', JSON.stringify(customizations));
    const response = await axios.post(`${url}/api/food/add`, formData);
    if (response.data.success) {
      setData({
        name: '',
        description: '',
        price: '',
        category: 'Salad',
      });
      setImage(false);
      setCustomizations([]);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Type here" />
        </div>
        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder="Write content here" required></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category">
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name="price" placeholder="$20" />
          </div>
        </div>
        <div className="add-customizations">
          <p>Customizations</p>
          {customizations.map((customization, index) => (
            <div key={index} className="customization-item">
              <input name="name" value={customization.name} onChange={(e) => handleCustomizationChange(index, e)} placeholder="Customization Name (e.g., Protein)" />
              <button type="button" onClick={() => removeCustomization(index)}>Remove</button>
              {customization.options.map((option, optionIndex) => (
                <div key={optionIndex} className="option-item">
                  <input name="name" value={option.name} onChange={(e) => handleOptionChange(index, optionIndex, e)} placeholder="Option Name" />
                  <input name="price" value={option.price} onChange={(e) => handleOptionChange(index, optionIndex, e)} type="number" placeholder="Option Price" />
                  <button type="button" onClick={() => removeOption(index, optionIndex)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => addOption(index)}>Add Option</button>
            </div>
          ))}
          <button type="button" onClick={addCustomization}>Add Customization</button>
        </div>
        <button type="submit" className="add-btn">ADD</button>
      </form>
    </div>
  );
};

export default Add
