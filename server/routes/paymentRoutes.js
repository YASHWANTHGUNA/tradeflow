import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Matches: POST http://localhost:5000/api/payments/create-order
router.post('/create-order', protect, createOrder);

// Matches: POST http://localhost:5000/api/payments/verify
router.post('/verify', protect, verifyPayment);

export default router;