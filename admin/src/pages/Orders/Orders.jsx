import React from 'react'
import './Orders.css'
import { useState } from 'react'
import { toast } from "react-toastify"
import { useEffect } from 'react'
import axios from "axios"

const Orders = ({ url }) => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        // Sort orders: active orders first (newest first), then delivered/completed orders (newest first)
        const activeOrders = response.data.data.filter(order => 
          order.status !== 'Delivered' && order.status !== 'Completed'
        );
        const finishedOrders = response.data.data.filter(order => 
          order.status === 'Delivered' || order.status === 'Completed'
        );
        
        const sortedActiveOrders = activeOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        const sortedFinishedOrders = finishedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setOrders([...sortedActiveOrders, ...sortedFinishedOrders]);
      }
      else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      toast.error("Error fetching orders")
    } finally {
      setLoading(false);
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url+"/api/order/status",{
        orderId,
        status:event.target.value
      })
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Order status updated successfully!");
      }
    } catch (error) {
      toast.error("Error updating order status");
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed':
        return '#f59e0b';
      case 'Order Accepted':
        return '#3b82f6';
      case 'Being Prepared':
        return '#8b5cf6';
      case 'Out for Delivery':
        return '#f97316';
      case 'Delivered':
        return '#10b981';
      case 'Completed':
        return '#059669';
      default:
        return '#6b7280';
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed':
        return '📋';
      case 'Order Accepted':
        return '✅';
      case 'Being Prepared':
        return '👨‍🍳';
      case 'Out for Delivery':
        return '🚚';
      case 'Delivered':
        return '📦';
      case 'Completed':
        return '🎉';
      default:
        return '📦';
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [])

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h2>Orders Management</h2>
          <p>Track and manage all restaurant orders</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="header-content">
          <h2>Orders Management</h2>
          <p>Track and manage all restaurant orders</p>
        </div>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {orders.filter(order => order.status !== 'Delivered' && order.status !== 'Completed').length}
            </span>
            <span className="stat-label">Active Orders</span>
          </div>
        </div>
      </div>

      <div className="orders-grid">
        {orders.map((order, index) => (
          <div key={index} className={`order-card ${order.status === 'Delivered' || order.status === 'Completed' ? 'completed' : ''}`}>
            <div className="order-header">
              <div className="order-id">
                <span className="order-number">#{order._id.slice(-6).toUpperCase()}</span>
                <span className="order-date">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                <span className="status-icon">{getStatusIcon(order.status)}</span>
                <span className="status-text">{order.status}</span>
              </div>
            </div>

            <div className="order-content">
              <div className="order-items">
                <h4>Order Items</h4>
                <div className="items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="customer-info">
                <h4>Customer Details</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{order.address.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{order.address.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{order.address.email}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{order.address.location}</span>
                  </div>
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-item">
                  <span>Total Items:</span>
                  <span className="summary-value">{order.items.length}</span>
                </div>
                <div className="summary-item">
                  <span>Total Amount:</span>
                  <span className="summary-value amount">₵{order.amount}</span>
                </div>
              </div>
            </div>

            <div className="order-actions">
              <select 
                onChange={(event) => statusHandler(event, order._id)} 
                value={order.status}
                className={`status-select ${order.status === 'Delivered' || order.status === 'Completed' ? 'completed' : ''}`}
                disabled={order.status === 'Delivered' || order.status === 'Completed'}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Order Accepted">Order Accepted</option>
                <option value="Being Prepared">Being Prepared</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>Orders will appear here when customers place them</p>
        </div>
      )}
    </div>
  )
}

export default Orders
