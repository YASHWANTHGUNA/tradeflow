// server/models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true }, // bcrypt hash, never store plain OTP
    purpose: {
      type: String,
      enum: ["register", "password_reset"],
      default: "register",
    },
    // Registration payload held here until OTP is verified.
    // Password is stored hashed even at this pending stage.
    pendingUser: {
      name: String,
      passwordHash: String,
      role: { type: String, enum: ["customer", "merchant"] },
    },
    attempts: { type: Number, default: 0 },
    // TTL index: Mongo auto-deletes the doc once expiresAt passes
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

// One active OTP per email+purpose at a time
otpSchema.index({ email: 1, purpose: 1 });

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);