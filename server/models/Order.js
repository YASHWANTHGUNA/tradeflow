import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // 1. Core Relationships
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  
  // 2. Hardware & Cart Metrics
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price per unit
  totalAmount: { type: Number, required: true }, // quantity * price
  
  // 3. Payment Gateway Security (Updated from Paystack to Razorpay)
  razorpayOrderId: { type: String, required: true }, // NOTE: Removed unique=true because 1 Razorpay Order might buy 3 different items!

  // 4. The Dual-Status Engine
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' // Defaults to completed since we currently create this after Razorpay verifies
  },
  fulfillmentStatus: { 
    type: String, 
    enum: ["Processing", "Shipped", "Delivered"], 
    default: "Processing" 
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);