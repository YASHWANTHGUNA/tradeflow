import Order from "../models/Order.js";

// Fetch all active orders for the logged-in merchant
export const getMerchantOrders = async (req, res) => {
  try {
    // req.user.id comes from your auth middleware
    const orders = await Order.find({ merchant: req.user.id })
      .populate("product", "title image") // Gets the hardware details
      .populate("buyer", "name email")    // Gets the customer details
      .sort({ createdAt: -1 });           // Newest orders at the top

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching merchant orders:", error);
    res.status(500).json({ message: "Failed to fetch active orders." });
  }
};

// Update fulfillment status (Processing -> Shipped -> Delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // We use findOneAndUpdate to ensure the merchant actually owns this order
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, merchant: req.user.id },
      { fulfillmentStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found or unauthorized access." });
    }

    res.status(200).json({ message: "Shipping status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update shipping ledger." });
  }
};