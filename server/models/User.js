// server/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'merchant'],
      default: 'customer',
    },
    // Razorpay Specific Data for Merchants
    razorpayAccountId: {
      type: String,
      default: null, // Only populated when a merchant connects their bank account
    },
    isDetailsSubmitted: {
      type: Boolean,
      default: false,
    },
    // Ledger System Data
    walletBalance: {
      type: Number,
      default: 0, // Every merchant starts with ₹0
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);
export default User;
