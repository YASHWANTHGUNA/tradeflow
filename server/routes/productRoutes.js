// server/routes/productRoutes.js
import express from 'express';
import { createProduct, uploadProductImage, getProducts, getMerchantProducts } from '../controllers/productController.js';

import { upload } from '../config/cloudinary.js';
import { protect, merchantOnly } from '../middleware/authMiddleware.js';



const router = express.Router();

// The middlewares run first. If they fail, createProduct never executes.
router.get('/', getProducts);
router.get('/merchant', protect, merchantOnly, getMerchantProducts);
router.post('/', protect, merchantOnly, createProduct);
router.post('/upload', protect, upload.single("image"), uploadProductImage);

export default router;
