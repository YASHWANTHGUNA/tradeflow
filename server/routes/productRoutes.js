// server/routes/productRoutes.js
import express from 'express';
import { createProduct } from '../controllers/productController.js';
import { protect, merchantOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// The middlewares run first. If they fail, createProduct never executes.
router.post('/', protect, merchantOnly, createProduct);

export default router;
