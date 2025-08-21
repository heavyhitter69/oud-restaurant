import axios from "axios";
import { createContext, useState, useEffect, useCallback } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      if (!savedCart || savedCart === "undefined" || savedCart === "null") {
        return {};
      }
      return JSON.parse(savedCart);
    } catch (error) {
      console.error("Error parsing cartItems from localStorage:", error);
      localStorage.removeItem("cartItems"); // Clear invalid data
      return {};
    }
  });
  const [cartVersion, setCartVersion] = useState(0); // Force re-render when cart changes
  
  // Use environment variable for API URL, fallback to localhost for development
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  
  const [token, setToken] = useState(() => {
    // Check if user wants a fresh start (from URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const freshStart = urlParams.get('fresh');
    
    if (freshStart === 'true') {
      // Clear all data for fresh start
      localStorage.clear();
      sessionStorage.clear();
      return "";
    }
    
    return localStorage.getItem("token") || "";
  });
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || "");
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem("userData");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parsing userData from localStorage:", error);
      return null;
    }
  });
  const [food_list, setFoodList] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartClearedAfterOrder, setCartClearedAfterOrder] = useState(false);

  // Custom setCartItems function that also updates localStorage
  const setCartItemsAndPersist = useCallback((newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem("cartItems", JSON.stringify(newCartItems));
  }, []);

  // Add to cart with optimistic UI
  const addToCart = useCallback(async (itemId) => {
    console.log("Adding to cart:", itemId);
    setCartItemsAndPersist(prevCartItems => {
      const newCartItems = {
        ...prevCartItems,
        [itemId]: (prevCartItems[itemId] || 0) + 1
      };
      console.log("New cart items:", newCartItems);
      
      // Sync with server in background (non-blocking)
      if (token) {
        axios.post(url + "/api/cart/add", { itemId }, { headers: { token } })
          .then(() => console.log("Successfully synced to server"))
          .catch(error => {
            console.error("Failed to add to cart:", error);
            // Don't revert on network errors, let user retry
          });
      }
      
      return newCartItems;
    });
  }, [token, url, setCartItemsAndPersist]);

  // Remove from cart with optimistic UI
  const removeFromCart = useCallback(async (itemId) => {
    setCartItemsAndPersist(prevCartItems => {
      const newCartItems = {...prevCartItems};
      
      if (newCartItems[itemId] > 0) {
        newCartItems[itemId] -= 1;
        if (newCartItems[itemId] === 0) {
          delete newCartItems[itemId];
        }
      }
      
      // Sync with server in background (non-blocking)
      if (token) {
        axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } })
          .catch(error => {
            console.error("Failed to remove from cart:", error);
            // Don't revert on network errors, let user retry
          });
      }
      
      return newCartItems;
    });
  }, [token, url, setCartItemsAndPersist]);

  // Clear cart completely - BULLETPROOF SOLUTION
  const clearCart = useCallback(async () => {
    console.log("🚨 BULLETPROOF CART CLEARING INITIATED...");
    
    // STEP 1: Immediate state clearing
    setCartItems({});
    setCartVersion(prev => prev + 100); // Force massive re-render
    setCartClearedAfterOrder(true);
    
    // STEP 2: Clear all possible storage locations
    try {
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartData");
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cartItems");
      sessionStorage.removeItem("cartData");
      sessionStorage.removeItem("cart");
      
      // Clear any other possible cart keys
      Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('cart')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.toLowerCase().includes('cart')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Storage clearing error:", error);
    }
    
    // STEP 3: Dispatch multiple clearing events
    const events = ['cartCleared', 'forceCartReset', 'nuclearCartClear', 'cartReset', 'clearCart'];
    events.forEach(eventType => {
      for (let i = 0; i < 3; i++) {
        window.dispatchEvent(new CustomEvent(eventType));
      }
    });
    
    // STEP 4: Clear server cart
    if (token) {
      try {
        await axios.post(url + "/api/cart/clear", {}, { headers: { token } });
        console.log("✅ Server cart cleared");
      } catch (error) {
        console.error("❌ Server cart clearing failed:", error);
      }
    }
    
    // STEP 5: Force component updates
    setTimeout(() => {
      setCartItems({});
      setCartVersion(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('cartCleared'));
    }, 50);
    
    // STEP 6: Final verification and page refresh if needed
    setTimeout(() => {
      const remainingCart = localStorage.getItem("cartItems") || 
                           localStorage.getItem("cartData") || 
                           sessionStorage.getItem("cartItems");
      
      if (remainingCart && remainingCart !== "{}" && remainingCart !== "null") {
        console.log("🚨 Cart still exists, forcing page refresh...");
        // Save essential data before refresh
        const essentialData = {
          token: localStorage.getItem("token"),
          userAvatar: localStorage.getItem("userAvatar"),
          userData: localStorage.getItem("userData")
        };
        
        // Clear everything and refresh
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore essential data
        if (essentialData.token) localStorage.setItem("token", essentialData.token);
        if (essentialData.userAvatar) localStorage.setItem("userAvatar", essentialData.userAvatar);
        if (essentialData.userData) localStorage.setItem("userData", essentialData.userData);
        
        window.location.reload();
        return;
      }
      
      console.log("✅ BULLETPROOF CART CLEARING COMPLETED");
    }, 1000);
    
  }, [token, url]);

  // Force cart reset - more aggressive clearing
  const forceCartReset = useCallback(() => {
    console.log("Force resetting cart...");
    setCartItems({});
    setCartVersion(prev => prev + 1);
    setCartClearedAfterOrder(true);
    localStorage.removeItem("cartItems");
    
    // Dispatch a custom event to notify all components
    window.dispatchEvent(new CustomEvent('cartCleared'));
  }, []);

  // Calculate total cart amount
  const getTotalCartAmount = useCallback(() => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find(product => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  }, [cartItems, food_list]);

  // Calculate discount amount
  const getDiscountAmount = useCallback(() => {
    if (!appliedPromo) return 0;
    const subtotal = getTotalCartAmount();
    return (subtotal * appliedPromo.discountPercentage) / 100;
  }, [appliedPromo, getTotalCartAmount]);

  // Calculate final total after discount
  const getFinalTotal = useCallback(() => {
    const subtotal = getTotalCartAmount();
    const discount = getDiscountAmount();
    return subtotal - discount;
  }, [getTotalCartAmount, getDiscountAmount]);

  // Apply promo code
  const applyPromoCode = useCallback(async (code) => {
    try {
      // Check if promo code is already applied
      if (appliedPromo && appliedPromo.code === code.toUpperCase()) {
        return { 
          success: false, 
          message: 'This promo code is already applied!' 
        };
      }

      const response = await axios.post(url + "/api/promo/validate", { code });
      if (response.data.success) {
        setAppliedPromo(response.data.data);
        return { success: true, message: 'Promo code applied successfully!' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid promo code' 
      };
    }
  }, [url, appliedPromo]);

  // Remove promo code
  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  // Fetch food list
  const fetchFoodList = useCallback(async () => {
    try {
      console.log("Fetching food list from:", url + "/api/food/list");
      const response = await axios.get(url + "/api/food/list");
      console.log("Food list response:", response.data);
      setFoodList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch food list:", error);
    }
  }, [url]);

  // Load cart data
  const loadCartData = useCallback(async (token) => {
    if (cartLoaded) {
      console.log("Cart already loaded, skipping...");
      return;
    }
    
    try {
      console.log("Loading cart data for token:", token);
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
      console.log("Cart response:", response.data);
      
      const serverCartData = response.data.cartData || {};
      console.log("Server cart data:", serverCartData);
      
      // Only load server data if local cart is empty (first time login)
      let currentCartItems = {};
      try {
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
          currentCartItems = JSON.parse(savedCart);
        }
      } catch (error) {
        console.error("Error parsing localStorage cart:", error);
        localStorage.removeItem("cartItems");
      }
      
      if (Object.keys(currentCartItems).length === 0) {
        setCartItemsAndPersist(serverCartData);
        console.log("Loaded server cart data:", serverCartData);
      } else {
        // If local cart has items, sync local to server instead
        try {
          await axios.post(url + "/api/cart/sync", { cartData: currentCartItems }, { headers: { token } });
          console.log("Synced local cart to server");
        } catch (syncError) {
          console.error("Failed to sync cart:", syncError);
        }
      }
      
      setCartLoaded(true);
    } catch (error) {
      console.error("Failed to load cart:", error);
      // Don't throw error to prevent login failure
    }
  }, [url, setCartItemsAndPersist, cartLoaded]);

  // Custom setToken function that also updates localStorage
  const setTokenAndPersist = useCallback((newToken, avatar = "", userInfo = null) => {
    console.log("Setting token:", newToken);
    console.log("Setting avatar:", avatar);
    console.log("Setting user data:", userInfo);
    setToken(newToken);
    setUserAvatar(avatar);
    if (userInfo) {
      setUserData(userInfo);
      localStorage.setItem("userData", JSON.stringify(userInfo));
    }
    if (newToken) {
      localStorage.setItem("token", newToken);
      if (avatar) {
        localStorage.setItem("userAvatar", avatar);
      }
      // Reset cart loaded flag for new token
      setCartLoaded(false);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("userData");
      setUserData(null);
      setCartLoaded(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    console.log("Logging out user...");
    setTokenAndPersist("");
    setCartItemsAndPersist({});
    setCartClearedAfterOrder(false);
    setCartLoaded(false);
    setAppliedPromo(null);
    // Clear all localStorage
    localStorage.clear();
    // Force page refresh to ensure clean state
    window.location.reload();
  }, [setTokenAndPersist, setCartItemsAndPersist]);

  // Force logout - more aggressive clearing
  const forceLogout = useCallback(() => {
    console.log("Force logging out user...");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  }, []);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      await fetchFoodList();
      setIsInitialized(true);
    };
    
    if (!isInitialized) {
      initializeApp();
    }
  }, [fetchFoodList, isInitialized]);

  // Load cart data on app initialization if token exists
  useEffect(() => {
    if (token && isInitialized && !cartLoaded && !cartClearedAfterOrder) {
      loadCartData(token);
    }
  }, [token, isInitialized, loadCartData, cartLoaded, cartClearedAfterOrder]);

  // Reset cart when token changes
  useEffect(() => {
    if (!token) {
      setCartItemsAndPersist({});
      setCartLoaded(false);
      setCartClearedAfterOrder(false);
    }
  }, [token, setCartItemsAndPersist]);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } else {
      // Clear localStorage when cart is empty
      localStorage.removeItem("cartItems");
    }
  }, [cartItems]);

  const contextValue = {
    food_list,
    cartItems,
    cartVersion,
    setCartItems: setCartItemsAndPersist,
    addToCart,
    removeFromCart,
    clearCart,
    forceCartReset,
    getTotalCartAmount,
    getDiscountAmount,
    getFinalTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    url,
    token,
    userAvatar,
    userData,
    setToken: setTokenAndPersist,
    logout,
    forceLogout,
    loadCartData
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

