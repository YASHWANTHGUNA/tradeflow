// server/routes/paymentRoutes.js
import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Any logged-in user can create an order and verify a payment
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;