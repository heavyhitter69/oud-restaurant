import React from 'react';
import './TrackOrderPopup.css';
import { assets } from '../../assets/assets';

const TrackOrderPopup = ({ order, onClose }) => {
  const getStatusStep = (status) => {
    switch (status) {
      case 'Order Placed':
        return 0;
      case 'Order Accepted':
        return 1;
      case 'Being Prepared':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      case 'Completed':
        return 5;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(order.status);

  const steps = [
    { title: 'Order Placed', description: 'Your order has been received', icon: '📋' },
    { title: 'Order Accepted', description: 'Your order has been accepted', icon: '✅' },
    { title: 'Being Prepared', description: 'Your food is being prepared', icon: '👨‍🍳' },
    { title: 'Out for Delivery', description: 'Your order is on the way', icon: '🚚' },
    { title: 'Delivered', description: 'Your order has been delivered', icon: '📦' },
    { title: 'Completed', description: 'Order completed successfully', icon: '🎉' }
  ];

  return (
    <div className="track-order-popup-overlay" onClick={onClose}>
      <div className="track-order-popup" onClick={(e) => e.stopPropagation()}>
        <div className="track-order-header">
          <div className="header-content">
            <div className="order-id-section">
              <h3>Track Order</h3>
              <div className="order-id-badge">#{order._id.slice(-6)}</div>
            </div>
            <div className="order-meta">
              <div className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                </svg>
                <span>{order.items.length} items</span>
              </div>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="track-order-content">
          <div className="order-summary-card">
            <div className="summary-header">
              <h4>Order Summary</h4>
              <div className="total-amount">₵{order.amount}</div>
            </div>
            <div className="order-items">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="more-items">+{order.items.length - 3} more items</div>
              )}
            </div>
          </div>

          <div className="progress-tracker">
            <div className="tracker-header">
              <h4>Order Progress</h4>
              <div className="progress-percentage">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
            
            <div className="progress-line">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'current' : ''}`}>
                    <div className="step-circle">
                      {index < currentStep ? (
                        <div className="step-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </div>
                      ) : index === currentStep ? (
                        <div className="step-icon">
                          <span>{step.icon}</span>
                        </div>
                      ) : (
                        <span className="step-number">{index + 1}</span>
                      )}
                    </div>
                    <div className="step-label">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`progress-dash ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'animating' : ''}`}>
                      <div className="dash-line"></div>
                      <div className="dash-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="current-status-card">
            <div className="status-header">
              <h4>Current Status</h4>
              <div className="status-indicator">
                <div className="status-dot"></div>
                <span>Active</span>
              </div>
            </div>
            <div className="status-content">
              <div className="status-badge">{order.status}</div>
              <p className="status-description">
                {steps[currentStep]?.description || 'Your order is being processed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPopup;
