import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc    Get current logged in user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user is supplied by your JWT protect middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Base data for both roles
    let profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      joinedAt: user.createdAt,
    };

    // Role-specific data aggregation
    if (user.role === "customer") {
      // 1. Fetch legacy arrays (Favorites & Cart)
      const populatedUser = await User.findById(user._id)
        .populate("favorites")
        .populate("cart.product");

      // 2. THE FIX: Fetch from the new Order collection instead of the legacy array
      const userOrders = await Order.find({ buyer: user._id })
        .populate("product") // Pulls in the image, title, etc.
        .sort({ createdAt: -1 }); // Newest first

      // 3. Format the data to prevent the frontend ProfileListModal from breaking
      const formattedHistory = userOrders
        .filter((order) => order.product) // Safety check in case a product was deleted
        .map((order) => ({
          ...order.product.toObject(),
          _id: order._id, // Assign the Order ID as the unique key
          productId: order.product._id,
          price: order.price, // Show the historic price they paid, not the current live price
          fulfillmentStatus: order.fulfillmentStatus,
          purchasedAt: order.createdAt,
        }));

      profileData.favorites = populatedUser.favorites || [];
      profileData.purchaseHistory = formattedHistory || []; // Injects the V2 Ledger into the V1 variable
      profileData.cart = populatedUser.cart || [];
      profileData.shippingAddress = user.shippingAddress;
    } else if (user.role === "merchant") {
      // Find all products where this merchant is the vendor
      const activeListings = await Product.find({ vendor: user._id });

      profileData.walletBalance = user.walletBalance || 0;
      profileData.activeListings = activeListings;
      profileData.storeDetails = user.storeDetails;
      profileData.razorpayAccountId = user.razorpayAccountId;
      profileData.isDetailsSubmitted = user.isDetailsSubmitted;
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Update Universal Fields
    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    // Optional: Password update logic
    if (req.body.password) {
      user.password = req.body.password; // Note: Ensure you have a pre-save hook in User.js to bcrypt this!
    }

    // 2. Update Role-Specific Fields
    if (user.role === "customer") {
      user.shippingAddress = {
        street: req.body.street || user.shippingAddress?.street || "",
        city: req.body.city || user.shippingAddress?.city || "",
        state: req.body.state || user.shippingAddress?.state || "",
        postalCode:
          req.body.postalCode || user.shippingAddress?.postalCode || "",
      };
    } else if (user.role === "merchant") {
      user.storeDetails = {
        storeName: req.body.storeName || user.storeDetails?.storeName || "",
        storeDescription:
          req.body.storeDescription ||
          user.storeDetails?.storeDescription ||
          "",
        gstNumber: req.body.gstNumber || user.storeDetails?.gstNumber || "",
      };

      // Mark details as submitted if store name is provided
      if (req.body.storeName) {
        user.isDetailsSubmitted = true;
      }
    }

    // 3. Save to MongoDB
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server Error: Could not update profile" });
  }
};
