import userModel from "../models/userModel.js";

const generateCartItemId = (itemId, customizations) => {
  if (!customizations || Object.keys(customizations).length === 0) {
    return itemId;
  }
  const sortedKeys = Object.keys(customizations).sort();
  const customizationString = sortedKeys.map(key => `${key}-${customizations[key]}`).join('_');
  return `${itemId}_${customizationString}`;
};

// Add items to user cart
const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = userData.cartData;
    const cartItemId = generateCartItemId(req.body.itemId, req.body.customizations);
    if (!cartData[cartItemId]) {
      cartData[cartItemId] = 1;
    } else {
      cartData[cartItemId] += 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    const cartItemId = generateCartItemId(req.body.itemId, req.body.customizations);
    if (cartData[cartItemId] > 0) {
      cartData[cartItemId] -= 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Fetch user cart data
const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Sync cart data
const syncCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: req.body.cartData });
    res.json({ success: true, message: "Cart synced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Clear user cart
const clearCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    res.json({ success: true, message: "Cart cleared successfully", cartData: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { addToCart, removeFromCart, getCart, syncCart, clearCart };
