import React, { useEffect, useState, useContext } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const { url, clearCart, forceCartReset } = useContext(StoreContext);
  const navigate = useNavigate();

  // Get parameters from both URL search params and hash params
  const reference = searchParams.get("reference") || new URLSearchParams(window.location.hash.split('?')[1] || '').get("reference");
  const trxref = searchParams.get("trxref") || new URLSearchParams(window.location.hash.split('?')[1] || '').get("trxref");
  const status_param = searchParams.get("status") || new URLSearchParams(window.location.hash.split('?')[1] || '').get("status");

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'failed'
  const [countdown, setCountdown] = useState(2);

  const verifyPayment = async () => {
    try {
      console.log("URL params:", { reference, trxref, status_param });
      console.log("Current URL:", window.location.href);
      
      // Check if Paystack already indicated success/failure
      if (status_param === "success") {
        // Paystack indicates success, now verify with our backend
        const ref = reference || trxref;
        if (!ref) {
          console.log("No reference found in URL");
          setStatus("failed");
          return;
        }
        
        console.log("Verifying payment with reference:", ref);
        const response = await axios.post(url + "/api/order/verify", { reference: ref });
        console.log("Backend verification response:", response.data);
        
        if (response.data.success) {
          setStatus("success");
          // Clear the cart after successful payment
          await clearCart();
          // Also force cart reset for immediate UI update
          forceCartReset();
          
          // Force a small delay to ensure cart clearing is processed
          setTimeout(() => {
            // Start countdown
            const countdownInterval = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  // Force page refresh to ensure cart is cleared
                  window.location.href = "/#/myorders";
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }, 500);
        } else {
          console.log("Verification failed:", response.data.message);
          setStatus("failed");
        }
      } else if (status_param === "cancelled" || status_param === "failed") {
        // Paystack indicates failure
        console.log("Payment cancelled or failed by Paystack");
        setStatus("failed");
      } else {
        // No status parameter, but reference exists - this is likely a successful payment
        const ref = reference || trxref;
        if (ref) {
          console.log("No status param, but reference found. This is likely a successful payment. Verifying...");
          const response = await axios.post(url + "/api/order/verify", { reference: ref });
          console.log("Verification response:", response.data);
          
          if (response.data.success) {
            console.log("Payment verification successful!");
            setStatus("success");
            // Start countdown
            const countdownInterval = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  navigate("/myorders");
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            console.log("Payment verification failed:", response.data.message);
            // If verification fails but we have a reference, it might be a timing issue
            // or the payment is still processing. Let's give it a moment and try again
            console.log("First verification failed, trying again in 3 seconds...");
            setTimeout(async () => {
              try {
                const retryResponse = await axios.post(url + "/api/order/verify", { reference: ref });
                console.log("Retry verification response:", retryResponse.data);
                          if (retryResponse.data.success) {
            setStatus("success");
            // Clear the cart after successful payment
            await clearCart();
            // Also force cart reset for immediate UI update
            forceCartReset();
            
            // Force a small delay to ensure cart clearing is processed
            setTimeout(() => {
              // Start countdown
              const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                  if (prev <= 1) {
                    clearInterval(countdownInterval);
                    // Force page refresh to ensure cart is cleared
                    window.location.href = "/#/myorders";
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }, 500);
          } else {
                  setStatus("failed");
                }
              } catch (retryError) {
                console.error("Retry verification error:", retryError);
                setStatus("failed");
              }
            }, 3000);
          }
        } else {
          console.log("No reference or status found");
          setStatus("failed");
          // Show a more helpful error message with retry options
          setTimeout(() => {
            if (window.confirm("Payment verification failed. Would you like to try again?")) {
              navigate("/cart");
            } else {
              navigate("/");
            }
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("failed");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className='verify'>
      <div className="verify-container">
        {status === "verifying" && (
          <>
            <LoadingSpinner size="large" text="Verifying your payment..." />
            <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
              <p>Debug Info:</p>
              <p>Reference: {reference || 'None'}</p>
              <p>Trxref: {trxref || 'None'}</p>
              <p>Status: {status_param || 'None'}</p>
              <p>API URL: {url}</p>
            </div>
          </>
        )}
        {status === "success" && (
          <>
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark draw"></div>
              </div>
            </div>
            <h2 className="status-text success">Payment Successful!</h2>
            <p className="status-message">Your order has been confirmed and is being processed.</p>
            <div className="redirect-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="redirect-text">Redirecting to your orders in <span className="countdown">{countdown}</span> seconds...</p>
            </div>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="icon failed">✕</div>
            <h2 className="status-text failed">Payment Verification Failed</h2>
            <p className="status-message">We couldn't verify your payment automatically. This might be due to a temporary issue.</p>
            <div className="verify-actions">
              <button onClick={() => navigate("/myorders")} className="check-orders-btn">Check My Orders</button>
              <button onClick={() => navigate("/cart")} className="retry-btn">Try Payment Again</button>
              <button onClick={() => navigate("/")} className="home-btn">Go Home</button>
            </div>
            <p style={{fontSize: '0.9rem', color: '#666', marginTop: '1rem'}}>
              If you believe your payment was successful, please check your orders or contact support.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;

