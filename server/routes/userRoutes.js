import express from 'express';
import { getUserProfile, updateUserProfile,getFavorites, toggleFavorite, removeFavorite   } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js'; 


const router = express.Router();

// The 'protect' middleware enforces the JWT check before running getUserProfile
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.route('/favorites')
  .get(protect, getFavorites)
  .post(protect, toggleFavorite);
  router.delete('/favorites', protect, removeFavorite);

export default router;