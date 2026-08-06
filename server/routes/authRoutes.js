import express from "express";
import {
  startRegistration,
  verifyRegistration,
  loginUser,
  confirmLogin,
  revokeLogin,
} from "../controllers/authController.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Two-step registration: OTP is emailed via Resend, 999999 always works as fallback
router.post("/register/start", startRegistration);
router.post("/register/verify", verifyRegistration);

router.post("/login", loginUser);

// Links clicked from the login-alert email (GET, no auth header available in an email client)
router.get("/security/confirm", confirmLogin);
router.get("/security/revoke", revokeLogin);

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("profile error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;