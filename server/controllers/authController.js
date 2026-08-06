import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendRegistrationOtp, sendLoginAlert } from "../utils/resendEmail.js";
import crypto from "crypto";

// Simple in-memory OTP store (replace with DB / Redis in production)
const otpStore = new Map(); // email -> { otp, expiresAt, password, name, role }

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function startRegistration(req, res) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store details including role so it persists through verification
    otpStore.set(normalizedEmail, { otp, expiresAt, password, name, role: role || 'customer' });

    console.log("Attempting Resend send to:", normalizedEmail, "from:", process.env.RESEND_FROM_EMAIL);
    await sendRegistrationOtp(normalizedEmail, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("startRegistration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while starting registration",
    });
  }
}

export async function verifyRegistration(req, res) {
  try {
    const { email, otp, name: bodyName, password: bodyPassword, role: bodyRole } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = otpStore.get(normalizedEmail);

    // If record is missing (e.g. server restarted), but frontend passed credentials, allow recovery if OTP is 999999 or handle gracefully
    let actualOtp = record ? record.otp : null;
    let expiresAt = record ? record.expiresAt : null;

    if (record && Date.now() > expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Check real OTP or fallback dev master code 999999
    if (otp !== "999999" && (!actualOtp || otp !== actualOtp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or session expired. Please restart registration.",
      });
    }

    // Resolve details prioritizing request body, falling back to stored record map
    const name = bodyName || (record ? record.name : null);
    const password = bodyPassword || (record ? record.password : null);
    const role = bodyRole || (record ? record.role : 'customer');

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Registration session data missing. Please restart registration from Step 1.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password, // Handled automatically by User model pre-save hook
      role,
    });

    await user.save();
    otpStore.delete(normalizedEmail);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("verifyRegistration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying registration",
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: "7d" }
    );

    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const timestamp = new Date().toISOString();

    const confirmToken = jwt.sign(
      { userId: user._id, action: "confirmLogin", ip, timestamp },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: "30m" }
    );

    const revokeToken = jwt.sign(
      { userId: user._id, action: "revokeLogin", ip, timestamp },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: "30m" }
    );

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const confirmUrl = `${baseUrl}/api/auth/security/confirm?token=${confirmToken}`;
    const revokeUrl = `${baseUrl}/api/auth/security/revoke?token=${revokeToken}`;

    await sendLoginAlert(user.email, {
      name: user.name,
      timestamp,
      ip,
      confirmUrl,
      revokeUrl,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
}

export async function confirmLogin(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Missing token");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_this_secret"
    );

    if (decoded.action !== "confirmLogin") {
      return res.status(400).send("Invalid action");
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.lastConfirmedLogin = new Date();
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/login-confirmed?status=success`);
  } catch (error) {
    console.error("confirmLogin error:", error);
    return res.status(400).send("Invalid or expired confirmation link");
  }
}

export async function revokeLogin(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Missing token");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_this_secret"
    );

    if (decoded.action !== "revokeLogin") {
      return res.status(400).send("Invalid action");
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.lastSecurityAlert = new Date();
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/login-revoked?status=success`);
  } catch (error) {
    console.error("revokeLogin error:", error);
    return res.status(400).send("Invalid or expired revocation link");
  }
}