import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Marketing from './pages/Marketing/Marketing'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const App = () => {

  // Use environment variable for API URL, fallback to localhost for development
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000"

  return (
    <div className="admin-app">
      <ToastContainer/>
      <Navbar/>
      <div className="app-content">
        <Sidebar/>
        <main className="app-content-main">
          <Routes>
            <Route path= "/add" element= {<Add url={url}/>} />
            <Route path= "/list" element= {<List url={url}/>} />
            <Route path= "/orders" element= {<Orders url={url}/>} />
            <Route path= "/marketing" element= {<Marketing url={url}/>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
