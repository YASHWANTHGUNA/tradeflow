// server/routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Map the POST requests to their controller functions
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;