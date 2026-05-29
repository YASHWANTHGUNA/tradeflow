import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// The 'protect' middleware enforces the JWT check before running getUserProfile
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);


export default router;