import React, { useState, useContext } from 'react';
import Navbar from './components/Navbar/Navbar';
import Header from './components/Header/Header';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { StoreContext } from './context/StoreContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { token } = useContext(StoreContext);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          backgroundColor: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        }}
      />
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <ScrollToTop />
      <Navbar setShowLogin={setShowLogin} />
      {isHomePage && <Header />}
      <div className='app'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={token ? <PlaceOrder /> : <Home />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/verify-test' element={<div style={{padding: '2rem', textAlign: 'center', fontSize: '2rem'}}>✅ Verify Test Route Working! 🎉</div>} />
          <Route path='/myorders' element={token ? <MyOrders /> : <Home />} />
          <Route path='/test' element={<div style={{padding: '2rem', textAlign: 'center'}}>Test route is working! 🎉</div>} />
          <Route path='*' element={<div style={{padding: '2rem', textAlign: 'center'}}>Page not found. <a href="/">Go home</a></div>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
