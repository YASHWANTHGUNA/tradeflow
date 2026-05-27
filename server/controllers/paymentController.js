import Razorpay from 'razorpay';
import crypto from 'crypto';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create a Razorpay Order for a product
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: product.price * 100, // Razorpay expects amount in smallest currency subunit (paise)
      currency: 'INR',
      receipt: `receipt_${product._id}`.substring(0, 40), // Capped at 40 chars per Razorpay docs
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      product,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Verify payment and update the Ledger
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
    } = req.body;

    // 1. Validate the cryptographic signature to prevent spoofing
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature detected! Potential tampering.",
      });
    }

    // 2. Locate the product to calculate earnings
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // 3. Process Ledger Logic (90% to vendor, 10% platform fee)
    const totalPaid = product.price;
    const platformFee = totalPaid * 0.10;
    const vendorEarnings = totalPaid - platformFee;

    await User.findByIdAndUpdate(
      product.vendor,
      { $inc: { walletBalance: vendorEarnings } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and ledger updated successfully.",
      vendorEarnings,
      platformFee,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during verification: " + error.message,
    });
  }
};