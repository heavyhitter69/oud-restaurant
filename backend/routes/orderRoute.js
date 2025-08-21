import express from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, verifyOrder,  userOrders, listOrders, updateStatus, webhookHandler } from "../controllers/orderController.js"
import { validateOrder } from "../middleware/validation.js"

const  orderRouter = express.Router();

orderRouter.post("/place",authMiddleware,validateOrder,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.get('/list',listOrders);
orderRouter.post("/status",updateStatus);
orderRouter.post("/webhook",webhookHandler);

export default orderRouter;