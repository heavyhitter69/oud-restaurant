import Promo from '../models/promoModel.js';

// Create a new promo code
const createPromo = async (req, res) => {
  try {
    const { code, discountPercentage, maxUses, validUntil, description } = req.body;

    // Check if promo code already exists
    const existingPromo = await Promo.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    // Validate discount percentage
    if (discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 1 and 100'
      });
    }

    // Validate valid until date
    const validUntilDate = new Date(validUntil);
    if (validUntilDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be in the future'
      });
    }

    const promo = new Promo({
      code: code.toUpperCase(),
      discountPercentage,
      maxUses,
      validUntil: validUntilDate,
      description
    });

    await promo.save();

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promo
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all promo codes (admin)
const getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: promos
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validate promo code (for users)
const validatePromo = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const promo = await Promo.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    // Check if promo code is expired
    if (new Date() > promo.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired'
      });
    }

    // Check if promo code has reached max uses
    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has reached maximum uses'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo code is valid',
      data: {
        code: promo.code,
        discountPercentage: promo.discountPercentage,
        description: promo.description
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply promo code (increment usage count)
const applyPromo = async (req, res) => {
  try {
    const { code } = req.body;

    const promo = await Promo.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    // Check if promo code is expired
    if (new Date() > promo.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired'
      });
    }

    // Check if promo code has reached max uses
    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has reached maximum uses'
      });
    }

    // Increment usage count
    promo.usedCount += 1;
    await promo.save();

    res.status(200).json({
      success: true,
      message: 'Promo code applied successfully',
      data: {
        code: promo.code,
        discountPercentage: promo.discountPercentage,
        description: promo.description
      }
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete promo code
const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await Promo.findByIdAndDelete(id);
    
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle promo code status
const togglePromoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const promo = await Promo.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo code status updated successfully',
      data: promo
    });
  } catch (error) {
    console.error('Error updating promo code status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  createPromo,
  getAllPromos,
  validatePromo,
  applyPromo,
  deletePromo,
  togglePromoStatus
};
