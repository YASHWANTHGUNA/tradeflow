import express from "express";
import { getMerchantOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js"; // <-- Make sure this matches your actual auth middleware path!

// 1. We officially define the router here
const router = express.Router();

// 2. We attach the routes to it
router.get("/merchant", protect, getMerchantOrders);
router.patch("/:id/status", protect, updateOrderStatus);

// 3. We export the defined router
export default router;