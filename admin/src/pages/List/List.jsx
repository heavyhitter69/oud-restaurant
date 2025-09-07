import React, { useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", category: "", price: "", description: "" });
  const [editImage, setEditImage] = useState(null);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);

    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error("Error fetching list");
    }
  };

  const removeFood = async (foodId) => {
    const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
    await fetchList();

    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error("Error removing food");
    }
  };

  const saveEdit = async (foodId) => {
    const formData = new FormData();
    formData.append("name", editValues.name);
    formData.append("category", editValues.category);
    formData.append("price", editValues.price);
    formData.append("description", editValues.description);
    
    if (editImage) {
      formData.append("image", editImage);
    }

    const response = await axios.put(`${url}/api/food/update/${foodId}`, formData);

    if (response.data.success) {
      toast.success("Updated successfully");
      setEditingId(null);
      setEditImage(null);
      fetchList();
    } else {
      toast.error("Failed to update");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <p>Add Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Description</b>
          <b>Category</b>
          <b>Price</b>
          <b>Actions</b>
        </div>

        {list.map((item, index) => (
          <div key={index} className="list-table-format">
            <img data-label="Image" src={`${url}/images/${item.image}`} alt={item.name} />

            {editingId === item._id ? (
              <>
                <div data-label="Image" className="edit-image-container">
                  <img 
                    src={editImage ? URL.createObjectURL(editImage) : `${url}/images/${item.image}`} 
                    alt={item.name} 
                  />
                  <input
                    type="file"
                    onChange={(e) => setEditImage(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
                <div data-label="Name">
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  />
                </div>
                <div data-label="Description">
                  <textarea
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div data-label="Category">
                  <select
                    value={editValues.category}
                    onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                  >
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
                <div data-label="Price">
                  <input
                    type="number"
                    value={editValues.price}
                    onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                  />
                </div>
                <div data-label="Actions" className="edit-actions">
                  <p onClick={() => saveEdit(item._id)} className="cursor">💾</p>
                  <p onClick={() => {
                    setEditingId(null);
                    setEditImage(null);
                  }} className="cursor">❌</p>
                </div>
              </>
            ) : (
              <>
                <p data-label="Name">{item.name}</p>
                <p data-label="Description" className="description-cell">{item.description}</p>
                <p data-label="Category">{item.category}</p>
                <p data-label="Price">${item.price}</p>
                <div data-label="Actions" className="action-buttons">
                  <p onClick={() => removeFood(item._id)} className="cursor">🗑️</p>
                  <p
                    onClick={() => {
                      setEditingId(item._id);
                      setEditValues({
                        name: item.name,
                        category: item.category,
                        price: item.price,
                        description: item.description,
                      });
                      setEditImage(null);
                    }}
                    className="cursor"
                  >
                    ✏️
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
