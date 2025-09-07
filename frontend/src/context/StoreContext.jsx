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
  const [showLogin, setShowLogin] = useState(false);

  // Persist cart to localStorage for anonymous users
  useEffect(() => {
    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  // Add to cart - supports local and server cart
  const addToCart = useCallback(async (itemId) => {
    if (token) {
      // Logged in: update server cart
      try {
        const response = await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        if (response.data.success) {
          setCartItems(response.data.cartData);
        }
      } catch (error) {
        console.error("Failed to add to cart on server:", error);
      }
    } else {
      // Not logged in: update local cart
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));
    }
  }, [token, url]);

  // Remove from cart - supports local and server cart
  const removeFromCart = useCallback(async (itemId) => {
    if (token) {
      // Logged in: update server cart
      try {
        const response = await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        if (response.data.success) {
          setCartItems(response.data.cartData);
        }
      } catch (error) {
        console.error("Failed to remove from cart on server:", error);
      }
    } else {
      // Not logged in: update local cart
      setCartItems((prev) => {
        const newCart = { ...prev };
        if (newCart[itemId] > 1) {
          newCart[itemId] -= 1;
        } else {
          delete newCart[itemId];
        }
        return newCart;
      });
    }
  }, [token, url]);

  // Clear cart completely - SERVER ONLY
  const clearCart = useCallback(async () => {
    console.log("🧹 CLEARING CART (server only)...");
    
    if (!token) {
      console.error("No token available for cart operation");
      return;
    }
    
    try {
      // Clear cart on server
      const response = await axios.post(url + "/api/cart/clear", {}, { headers: { token } });
      console.log("Server clear cart response:", response.data);
      
      if (response.data.success) {
        // Clear local state
        setCartItems({});
        setCartVersion(prev => prev + 1);
        setCartClearedAfterOrder(true);
        setCartLoaded(true);
        
        // Clear localStorage
        localStorage.removeItem("cartItems");
        
        // Dispatch event for components
        window.dispatchEvent(new CustomEvent('cartCleared'));
        
        console.log("✅ Cart cleared successfully (server only)");
      } else {
        console.error("❌ Server failed to clear cart:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Failed to clear cart on server:", error);
    }
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

  // Load cart data and sync with local cart
  const loadCartData = useCallback(async (token) => {
    if (cartLoaded) {
      console.log("Cart already loaded, skipping...");
      return;
    }

    try {
      // 1. Get server cart
      const serverResponse = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
      const serverCart = serverResponse.data.cartData || {};

      // 2. Get local cart from localStorage
      const localCartString = localStorage.getItem("cartItems");
      const localCart = localCartString && localCartString !== "undefined" && localCartString !== "null"
        ? JSON.parse(localCartString)
        : {};

      // 3. Merge carts
      const mergedCart = { ...serverCart };
      for (const itemId in localCart) {
        if (localCart.hasOwnProperty(itemId)) {
          mergedCart[itemId] = (mergedCart[itemId] || 0) + localCart[itemId];
        }
      }

      // 4. Update state with merged cart
      setCartItems(mergedCart);

      // 5. Sync merged cart back to server
      if (Object.keys(localCart).length > 0) {
        await axios.post(url + "/api/cart/sync", { cartData: mergedCart }, { headers: { token } });
        // 6. Clear local cart from localStorage after successful sync
        localStorage.removeItem("cartItems");
      }
      
      setCartLoaded(true);
      console.log("Cart loaded and synced with server.");

    } catch (error) {
      console.error("Failed to load and sync cart:", error);
      setCartItems({}); // Set empty cart on error
      setCartLoaded(true);
    }
  }, [url, cartLoaded]);

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
    setCartItems({});
    setCartClearedAfterOrder(false);
    setCartLoaded(false);
    setAppliedPromo(null);
    // Clear all localStorage
    localStorage.clear();
    // Force page refresh to ensure clean state
    window.location.reload();
  }, [setTokenAndPersist]);



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
      console.log("Loading cart data - conditions met");
      loadCartData(token);
    } else {
      console.log("Skipping cart load - conditions not met:", {
        hasToken: !!token,
        isInitialized,
        cartLoaded,
        cartClearedAfterOrder
      });
    }
  }, [token, isInitialized, loadCartData, cartLoaded, cartClearedAfterOrder]);

  // Reset cart when token changes
  useEffect(() => {
    if (!token) {
      setCartItems({});
      setCartLoaded(false);
      setCartClearedAfterOrder(false);
    }
  }, [token]);

  // REMOVED: localStorage persistence - using server-only cart management

  const contextValue = {
    food_list,
    cartItems,
    cartVersion,
    setCartItems,
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
    loadCartData,
    showLogin,
    setShowLogin
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

