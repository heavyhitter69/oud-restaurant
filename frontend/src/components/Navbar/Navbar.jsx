import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { toast } from 'react-toastify';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [search, setSearch] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { getTotalCartAmount, token, userAvatar, logout, forceLogout, food_list = [] } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredResults([]);
    } else {
      const filtered = food_list.filter(item =>
        item.name && item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  }, [search, food_list]);

  const handleSuggestionClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setSearch("");
      setFilteredResults([]);
    }
  };

  // Always show search on mobile, conditional on desktop
  const shouldShowSearch = isHomePage || isMobile;

  return (
    <div className='navbar'>
      <Link to='/' onClick={() => setMenu("home")}>
        <img src={assets.logo_2} alt="" className="logo" />
      </Link>
      
      <ul className="navbar-menu">
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
        <a href='#app-download' onClick={() => setMenu("mobile app")} className={menu === "mobile app" ? "active" : ""}>mobile app</a>
        <a href='#footer' onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</a>
      </ul>

      <div className="navbar-right">
        {/* SEARCH CONTAINER - ALWAYS VISIBLE ON MOBILE */}
        {shouldShowSearch && (
          <div className="navbar-search-container">
            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
            />
            <img src={assets.search_icon} alt="" className="navbar-search-icon-actual" />
            {search && filteredResults.length > 0 && (
              <div className="search-suggestions">
                {filteredResults.map(item => (
                  <p key={item._id} onClick={() => handleSuggestionClick(item._id)}>
                    {item.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="navbar-search-icon">
          <Link to='/cart'>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {getTotalCartAmount() > 0 && <div className="dot"></div>}
          </Link>
        </div>

        {!token ? (
          <div className='navbar-profile'>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <ul className="nav-profile-dropdown">
              <li onClick={() => setShowLogin(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <p>Sign In</p>
              </li>
              <hr />
              <li className="theme-toggle-item">
                <ThemeToggle />
                <p>Theme</p>
              </li>
            </ul>
          </div>
        ) : (
          <div className='navbar-profile'>
            {userAvatar ? (
              <div className="user-avatar" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {userAvatar}
              </div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p>Orders</p>
              </li>
              <hr />
              <li className="theme-toggle-item">
                <ThemeToggle />
                <p>Theme</p>
              </li>
              <hr />
              <li onClick={() => {
                logout();
                toast.success('Signed out successfully!');
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <p>Logout</p>
              </li>
              <li onClick={() => {
                forceLogout();
                toast.info('Force logged out - all data cleared!');
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <p>Force Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
