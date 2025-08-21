import validator from 'validator';

// Sanitize and validate user registration data
export const validateRegistration = (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate name
    if (!name || !validator.isLength(name, { min: 2, max: 50 })) {
      return res.status(400).json({ 
        success: false, 
        message: "Name must be between 2 and 50 characters" 
      });
    }
    
    // Sanitize and validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }
    
    // Validate password strength
    if (!password || !validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }
    
    // Sanitize inputs
    req.body.name = validator.escape(name.trim());
    req.body.email = validator.normalizeEmail(email);
    
    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({ success: false, message: "Invalid input data" });
  }
};

// Sanitize and validate order data
export const validateOrder = (req, res, next) => {
  try {
    const { address, items, amount } = req.body;
    
    // Validate address
    if (!address || !address.name || !address.email || !address.phone || !address.location) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide complete delivery information" 
      });
    }
    
    // Validate email format
    if (!validator.isEmail(address.email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }
    
    // Validate phone number (Ghanaian format)
    const phoneRegex = /^\+233\s\d{2}\s\d{3}\s\d{4}$/;
    if (!phoneRegex.test(address.phone)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid Ghanaian phone number (+233 XX XXX XXXX)" 
      });
    }
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please add items to your cart" 
      });
    }
    
    // Validate amount
    if (!amount || !validator.isNumeric(amount.toString()) || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order amount" 
      });
    }
    
    // Sanitize address fields
    req.body.address.name = validator.escape(address.name.trim());
    req.body.address.email = validator.normalizeEmail(address.email);
    req.body.address.location = validator.escape(address.location.trim());
    
    next();
  } catch (error) {
    console.error('Order validation error:', error);
    res.status(400).json({ success: false, message: "Invalid order data" });
  }
};

// Sanitize and validate food item data
export const validateFoodItem = (req, res, next) => {
  try {
    const { name, description, price, category } = req.body;
    
    // Validate name
    if (!name || !validator.isLength(name, { min: 2, max: 100 })) {
      return res.status(400).json({ 
        success: false, 
        message: "Food name must be between 2 and 100 characters" 
      });
    }
    
    // Validate description
    if (description && !validator.isLength(description, { max: 500 })) {
      return res.status(400).json({ 
        success: false, 
        message: "Description must be less than 500 characters" 
      });
    }
    
    // Validate price
    if (!price || !validator.isNumeric(price.toString()) || price <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid price" 
      });
    }
    
    // Validate category
    const validCategories = ['Salad', 'Rolls', 'Deserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please select a valid category" 
      });
    }
    
    // Sanitize inputs
    req.body.name = validator.escape(name.trim());
    if (description) {
      req.body.description = validator.escape(description.trim());
    }
    req.body.price = parseFloat(price);
    
    next();
  } catch (error) {
    console.error('Food validation error:', error);
    res.status(400).json({ success: false, message: "Invalid food item data" });
  }
};
