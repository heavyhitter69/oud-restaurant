import foodModel from "../models/foodModel.js";
import fs from 'fs';

// Add food item
const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Get all food items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ✅ Update food item
const updateFood = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const foodId = req.params.id;

    // Handle image upload if provided
    let updateData = { name, category, price, description };
    
    if (req.file) {
      // Delete old image if new one is uploaded
      const oldFood = await foodModel.findById(foodId);
      if (oldFood && oldFood.image) {
        fs.unlink(`uploads/${oldFood.image}`, () => {});
      }
      updateData.image = req.file.filename;
    }

    const updated = await foodModel.findByIdAndUpdate(
      foodId,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Update failed", error });
  }
};

// Toggle stock status
const toggleStock = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }
        food.inStock = !food.inStock;
        await food.save();
        res.json({ success: true, message: "Stock status updated", data: food });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error updating stock status" });
    }
};

export { addFood, listFood, removeFood, updateFood, toggleStock };
