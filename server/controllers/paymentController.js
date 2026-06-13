import Razorpay from "razorpay";
import crypto from "crypto";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

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
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }
      // Multiply DB price by requested quantity
      totalAmount += product.price * item.quantity;
      validatedItems.push({
        product: product._id,
        vendor: product.vendor,
        price: product.price,
        quantity: item.quantity,
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
      return res
        .status(500)
        .json({ message: "Failed to create Razorpay order" });
    }

    // 3. Send order details AND the securely validated items back to frontend
    res.status(200).json({
      success: true,
      order,
      validatedItems, // We send this back so the frontend verification step knows exactly what was bought
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
      await Order.create({
        buyer: req.user.id,
        merchant: item.vendor,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.price * item.quantity, // Merged Schema Addition
        razorpayOrderId: razorpay_order_id, // Merged Schema Addition
        paymentStatus: "completed",
        fulfillmentStatus: "Processing",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Payment verified, history logged, and ledgers updated successfully.",
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during verification: " + error.message,
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // 1. Verify the signature to ensure the request actually came from Razorpay
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      console.error("Webhook signature mismatch! Potential attack.");
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // 2. Process the specific event
    const event = req.body.event;
    
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      // Automatically find the order(s) and lock them in as completed
      await Order.updateMany(
        { razorpayOrderId: razorpayOrderId },
        { 
          $set: { 
            paymentStatus: 'completed',
            fulfillmentStatus: 'Processing' 
          } 
        }
      );
      
      console.log(`[WEBHOOK] Ledger automatically updated for order: ${razorpayOrderId}`);
    }

    // Always return a 200 OK so Razorpay knows you received it
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook failed' });
  }
};
