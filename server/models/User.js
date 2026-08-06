import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // CORE AUTHENTICATION & PROFILE
    // ==========================================
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
      enum: ['customer', 'merchant'], // Preserved your existing role definitions
      default: 'customer',
    },
    tokenVersion: {
      type: Number,
      default: 0,
      // Bumped whenever the user clicks "No, secure my account" on a login
      // alert. Every JWT carries the tokenVersion it was issued with, so
      // bumping this instantly invalidates every existing session/token
      // without needing a server-side token blacklist.
    },
    profilePicture: {
      type: String,
      default: '', // Ready to hold an image URL (e.g., Cloudinary)
    },
    phoneNumber: {
      type: String,
      default: '',
    },

    // ==========================================
    // CUSTOMER SPECIFIC FIELDS
    // ==========================================
    shippingAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Relates directly to your Product model
      }
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: { type: Number, default: 1 },
      }
    ],
    purchaseHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
      }
    ],

    // ==========================================
    // MERCHANT SPECIFIC FIELDS
    // ==========================================
    storeDetails: {
      storeName: { type: String, default: '' },
      storeDescription: { type: String, default: '' },
      gstNumber: { type: String, default: '' }, 
    },
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

// Hash password automatically before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare entered password with hashed database password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Fallback pattern to prevent "Cannot overwrite model once compiled" errors during backend server restarts
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;