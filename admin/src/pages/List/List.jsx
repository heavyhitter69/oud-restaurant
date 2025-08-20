import React, { useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", category: "", price: "" });

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
    const response = await axios.put(`${url}/api/food/update/${foodId}`, editValues);

    if (response.data.success) {
      toast.success("Updated successfully");
      setEditingId(null);
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
          <b>Category</b>
          <b>Price</b>
          <b>Actions</b>
        </div>

        {list.map((item, index) => (
          <div key={index} className="list-table-format">
            <img src={`${url}/images/${item.image}`} alt={item.name} />

            {editingId === item._id ? (
              <>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                />
                <input
                  type="text"
                  value={editValues.category}
                  onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                />
                <input
                  type="number"
                  value={editValues.price}
                  onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                />
                <p onClick={() => saveEdit(item._id)} className="cursor">💾</p>
                <p onClick={() => setEditingId(null)} className="cursor">❌</p>
              </>
            ) : (
              <>
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>${item.price}</p>
                <p onClick={() => removeFood(item._id)} className="cursor">🗑️</p>
                <p
                  onClick={() => {
                    setEditingId(item._id);
                    setEditValues({
                      name: item.name,
                      category: item.category,
                      price: item.price,
                    });
                  }}
                  className="cursor"
                >
                  ✏️
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
