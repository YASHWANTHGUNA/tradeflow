import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// The 'protect' middleware enforces the JWT check before running getUserProfile
router.get('/profile', protect, getUserProfile);

export default router;