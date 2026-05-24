// server/controllers/paymentController.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create a Razorpay Order for a product
// @route   POST /api/payments/create-order
// @access  Private (Customers only)
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
      amount: product.price * 100,
      currency: 'INR',
      receipt: `receipt_order_${product._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      product,
    });
  } catch (error) {
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

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature detected!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in database.",
      });
    }

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
      message: "Payment verified and ledger updated successfully",
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
