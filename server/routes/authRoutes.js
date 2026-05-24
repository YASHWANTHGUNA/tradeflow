// server/routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import User from '../models/User.js'; // Ensure the path matches your structure
import { protect } from '../middleware/authMiddleware.js'; // Ensure path matches

const router = express.Router();

// Map the POST requests to their controller functions
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, async (req, res) => {
  try {
    // req.user is provided by your protect middleware
    // .select('-password') ensures we never send the hash to the frontend
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
