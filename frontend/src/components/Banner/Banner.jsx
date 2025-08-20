import React, { useState, useEffect, useContext } from 'react';
import './Banner.css';
import { StoreContext } from '../../context/StoreContext';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { url } = useContext(StoreContext);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${url}/api/banner/public`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setBanners(data.data);
          // Show banner after a short delay for better UX
          setTimeout(() => setIsVisible(true), 1000);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, [url]);

  useEffect(() => {
    if (banners.length > 1 && isVisible) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length, isVisible]);

  const handleBannerClick = (banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300); // Match the CSS transition duration
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('banner-overlay')) {
      handleClose();
    }
  };

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0 || !isVisible) {
    return null;
  }

  const currentBannerData = banners[currentBanner];

  return (
    <div className={`banner-modal ${isClosing ? 'closing' : ''}`}>
      <div className="banner-overlay" onClick={handleOutsideClick}>
        <div className="banner-content-wrapper">
          {/* Close button */}
          <button className="banner-close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Banner content */}
          <div 
            className="banner-slide active"
            onClick={() => handleBannerClick(currentBannerData)}
            style={{ cursor: currentBannerData.link ? 'pointer' : 'default' }}
          >
            <img 
              src={`${url}/uploads/${currentBannerData.image}`} 
              alt={currentBannerData.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="banner-text-overlay">
              <div className="banner-text-content">
                <h2>{currentBannerData.title}</h2>
                {currentBannerData.subtitle && <p>{currentBannerData.subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Navigation arrows for multiple banners */}
          {banners.length > 1 && (
            <>
              <button className="banner-nav-btn banner-prev" onClick={handlePrevBanner}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              <button className="banner-nav-btn banner-next" onClick={handleNextBanner}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </>
          )}
          
          {/* Banner dots */}
          {banners.length > 1 && (
            <div className="banner-dots">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`banner-dot ${index === currentBanner ? 'active' : ''}`}
                  onClick={() => setCurrentBanner(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
