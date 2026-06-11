import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder, verifyPayment } from "../controllers/paymentController.js"; 

const router = express.Router();

// 1. THIS MUST BE "/create-order"
router.post("/create-order", protect, createOrder);

// 2. THIS MUST BE "/verify"
router.post("/verify", protect, verifyPayment);

export default router;