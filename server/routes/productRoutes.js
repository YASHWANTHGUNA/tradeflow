// server/routes/productRoutes.js
import express from 'express';
import { createProduct, uploadProductImage, getProducts, getMerchantProducts, getProductById } from '../controllers/productController.js';

import { upload } from '../config/cloudinary.js';
import { protect, merchantOnly } from '../middleware/authMiddleware.js';



const router = express.Router();

// The middlewares run first. If they fail, createProduct never executes.
router.get('/', getProducts);
router.get('/merchant', protect, merchantOnly, getMerchantProducts);
router.get('/:id', getProductById);
router.post('/', protect, merchantOnly, createProduct);
router.post('/upload', protect, upload.single("image"), uploadProductImage);

export default router;
