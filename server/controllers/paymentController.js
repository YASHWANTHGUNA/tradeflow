import Razorpay from 'razorpay';
import crypto from 'crypto';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create a Razorpay Order for a product
// @route   POST /api/payments/create-order
// @access  Private
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body; // We now expect an array of items [{ productId, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // 1. Securely calculate the total on the server
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      // Multiply DB price by requested quantity
      totalAmount += (product.price * item.quantity);
      validatedItems.push({
        product: product._id,
        vendor: product.vendor,
        price: product.price,
        quantity: item.quantity
      });
    }

    // 2. Create the Razorpay Order (Amount is in paise, so multiply by 100)
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }

    // 3. Send order details AND the securely validated items back to frontend
    res.status(200).json({
      success: true,
      order,
      validatedItems // We send this back so the frontend verification step knows exactly what was bought
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: "Server error during order creation" });
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
      items, // <-- Now expecting the array of items from the cart
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

    // 2. Process Ledger Logic for MULTIPLE items
    for (let item of items) {
      
      // A. Update the Buyer's Purchase History
      // req.user.id comes from your 'protect' middleware
      await User.findByIdAndUpdate(req.user.id, {
        $push: { purchaseHistory: item.product }
      });

      // B. Process Merchant Ledger Logic (90% to vendor, 10% platform fee)
      // We multiply by quantity in case they bought 3 of the same monitor
      const totalPaid = item.price * item.quantity;
      const vendorEarnings = totalPaid * 0.90;

      // Add the funds to the specific Merchant's wallet
      await User.findByIdAndUpdate(
        item.vendor,
        { $inc: { walletBalance: vendorEarnings } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Payment verified, history logged, and ledgers updated successfully.",
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during verification: " + error.message,
    });
  }
};