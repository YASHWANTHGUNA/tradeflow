import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get current logged in user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user is supplied by your JWT protect middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    if (user.role === 'customer') {
      // .populate() pulls the full product data instead of just the ObjectIds
      const populatedUser = await User.findById(user._id)
        .populate('favorites')
        .populate('purchaseHistory')
        .populate('cart.product');

      profileData.favorites = populatedUser.favorites || [];
      profileData.purchaseHistory = populatedUser.purchaseHistory || [];
      profileData.cart = populatedUser.cart || [];
      profileData.shippingAddress = user.shippingAddress;
      
    } else if (user.role === 'merchant') {
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
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};