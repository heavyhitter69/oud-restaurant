import React from 'react'
import './AppDownload.css'
import { assets } from '../../assets/assets'

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <div className="app-download-content">
        <h2>Download Our Mobile App</h2>
        <p>Experience the ultimate convenience with our mobile app. Order your favorite meals with just a few taps, track your delivery in real-time, and enjoy exclusive app-only promotions.</p>
        <div className="app-features">
          <div className="feature">
            <div className="feature-icon">🚀</div>
            <span>Fast & Easy Ordering</span>
          </div>
          <div className="feature">
            <div className="feature-icon">📍</div>
            <span>Real-time Tracking</span>
          </div>
          <div className="feature">
            <div className="feature-icon">🎁</div>
            <span>Exclusive Offers</span>
          </div>
        </div>
        <div className="app-download-platforms">
          <div className="platform-card">
            <img src={assets.play_store} alt="Google Play Store" />
            <span>Google Play</span>
          </div>
          <div className="platform-card">
            <img src={assets.app_store} alt="Apple App Store" />
            <span>App Store</span>
          </div>
        </div>
        <p className="coming-soon">Our app will be accessible on these platforms soon. Stay tuned for the launch!</p>
      </div>
    </div>
  )
}

export default AppDownload
