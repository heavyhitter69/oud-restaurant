import React, { useState, useEffect } from 'react'
import './Navbar.css'
import axios from 'axios'

const Navbar = () => {
  const [notificationCount, setNotificationCount] = useState(0)
  
  // Use environment variable for API URL, fallback to localhost for development
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000"

  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`)
      if (response.data.success) {
        const activeOrders = response.data.data.filter(order => 
          order.status !== 'Delivered' && order.status !== 'Completed'
        )
        setNotificationCount(activeOrders.length)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  useEffect(() => {
    fetchPendingOrders()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='navbar'>
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-avatar">
            <span>A</span>
          </div>
          <div className="brand-text">
            <h1>Admin</h1>
            <p>Restaurant Dashboard</p>
          </div>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-actions">
          <div className="notification-bell">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
          
          <div className="user-avatar">
            <div className="avatar-circle">
              <span>AD</span>
            </div>
            <div className="user-info">
              <p className="user-name">Admin User</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
