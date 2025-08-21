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

  // Add to cart - SIMPLIFIED (localStorage only)
  const addToCart = useCallback(async (itemId) => {
    console.log("Adding to cart:", itemId);
    setCartItemsAndPersist(prevCartItems => {
      const newCartItems = {
        ...prevCartItems,
        [itemId]: (prevCartItems[itemId] || 0) + 1
      };
      console.log("New cart items:", newCartItems);
      return newCartItems;
    });
  }, [setCartItemsAndPersist]);

  // Remove from cart - SIMPLIFIED (localStorage only)
  const removeFromCart = useCallback(async (itemId) => {
    setCartItemsAndPersist(prevCartItems => {
      const newCartItems = {...prevCartItems};
      
      if (newCartItems[itemId] > 0) {
        newCartItems[itemId] -= 1;
        if (newCartItems[itemId] === 0) {
          delete newCartItems[itemId];
        }
      }
      
      return newCartItems;
    });
  }, [setCartItemsAndPersist]);

  // Clear cart completely - SIMPLIFIED (localStorage only)
  const clearCart = useCallback(async () => {
    console.log("🧹 CLEARING CART (localStorage only)...");
    
    // Clear state immediately
    setCartItems({});
    setCartVersion(prev => prev + 1);
    setCartClearedAfterOrder(true);
    setCartLoaded(true); // Prevent reloading
    
    // Clear localStorage
    localStorage.removeItem("cartItems");
    
    // Dispatch event for components
    window.dispatchEvent(new CustomEvent('cartCleared'));
    
    console.log("✅ Cart cleared successfully (localStorage only)");
  }, []);

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

  // Load cart data - SIMPLIFIED (localStorage only)
  const loadCartData = useCallback(async (token) => {
    if (cartLoaded) {
      console.log("Cart already loaded, skipping...");
      return;
    }
    
    try {
      console.log("Loading cart data from localStorage only");
      
      // Only load from localStorage, don't sync with server
      let currentCartItems = {};
      try {
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
          currentCartItems = JSON.parse(savedCart);
          console.log("Loaded cart from localStorage:", currentCartItems);
        }
      } catch (error) {
        console.error("Error parsing localStorage cart:", error);
        localStorage.removeItem("cartItems");
      }
      
      // Set cart items from localStorage only
      setCartItemsAndPersist(currentCartItems);
      setCartLoaded(true);
      
      console.log("Cart loading completed");
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartLoaded(true); // Mark as loaded even if error
    }
  }, [setCartItemsAndPersist, cartLoaded]);

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

