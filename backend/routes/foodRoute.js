import express from "express";
import { addFood, listFood, removeFood, updateFood, toggleStock } from "../controllers/foodController.js";
import multer from "multer";
import { validateFoodItem } from "../middleware/validation.js";

const foodRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), validateFoodItem, addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.put("/update/:id", upload.single("image"), updateFood); // 🔥 Now supports image upload
foodRouter.post("/toggle-stock/:id", toggleStock);

export default foodRouter;
