import React from 'react'
import './Sidebar.css'
import { FaPlus, FaList, FaBox, FaBullhorn } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <p>Restaurant Management</p>
      </div>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
            <FaPlus />
            <p>Add Items</p>
        </NavLink>
         <NavLink to='/list' className="sidebar-option">
            <FaList />
            <p>List Items</p>
        </NavLink>
         <NavLink to='/orders' className="sidebar-option">
            <FaBox />
            <p>Orders</p>
        </NavLink>
         <NavLink to='/marketing' className="sidebar-option">
            <FaBullhorn />
            <p>Marketing</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
