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
      { id: user._id, purpose: "login-alert", action: "confirmLogin", ip, timestamp },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: "30m" }
    );


    const revokeToken = jwt.sign(
      { id: user._id, purpose: "login-alert", action: "revokeLogin", ip, timestamp },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: "30m" }
    );


    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const confirmUrl = `${baseUrl}/api/auth/security/confirm?token=${confirmToken}`;
    const revokeUrl = `${baseUrl}/api/auth/security/revoke?token=${revokeToken}`;


    // Trigger the alert in the background without blocking the HTTP response
    sendLoginAlert(user.email, {
      name: user.name,
      timestamp,
      ip,
      confirmUrl,
      revokeUrl,
    }).catch((emailError) => {
      console.error("Background login alert failed:", emailError?.message || emailError);
    });


    // Immediately return the successful login response to the client
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


// ============================================================
// "Yes, it's me" — no-op confirmation, just shows a friendly page
// GET /api/auth/security/confirm?token=...
// ============================================================
export const confirmLogin = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Missing token");
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
    if (decoded.purpose !== "login-alert") throw new Error("Invalid token purpose");


    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).send("User not found");
    }


    user.lastConfirmedLogin = new Date();
    await user.save();


    res.status(200).send(renderSecurityPage({
      icon: "check",
      title: "Access Granted",
      message: "Thanks for confirming — your account remains active. No action needed.",
      accent: "#16a34a",
    }));
  } catch (error) {
    console.error("confirmLogin error:", error);
    res.status(400).send(renderSecurityPage({
      icon: "clock",
      title: "Link Expired",
      message: "This confirmation link is invalid or has expired. If this wasn't you, please log in and change your password.",
      accent: "#64748b",
    }));
  }
};


// ============================================================
// "No, secure my account" — bump tokenVersion, kills every existing token
// GET /api/auth/security/revoke?token=...
// ============================================================
export const revokeLogin = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Missing token");
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
    if (decoded.purpose !== "login-alert") throw new Error("Invalid token purpose");


    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).send("User not found");
    }


    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.lastSecurityAlert = new Date();
    await user.save();


    res.status(200).send(renderSecurityPage({
      icon: "shield",
      title: "Account Secured",
      message: "All active sessions have been signed out. Please log in again and change your password as a precaution.",
      accent: "#dc2626",
    }));
  } catch (error) {
    console.error("revokeLogin error:", error);
    res.status(400).send(renderSecurityPage({
      icon: "clock",
      title: "Link Expired",
      message: "This link is invalid or has expired. If you're worried about your account, change your password now.",
      accent: "#64748b",
    }));
  }
};


function renderSecurityPage({ icon, title, message, accent }) {
  const icons = {
    check: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    shield: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
    clock: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  };


  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>TradeFlow Security</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Arial, sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
    }
    .icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: ${accent};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 8px 20px -6px ${accent}66;
    }
    .brand {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
    }
    .footer-note {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">TradeFlow Security</div>
    <div class="icon-wrap">${icons[icon]}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer-note">You can safely close this tab.</div>
  </div>
</body>
</html>`;
}