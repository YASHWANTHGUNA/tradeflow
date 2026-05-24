// server/controllers/productController.js
import Product from '../models/Product.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Merchant
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, image } = req.body;

    // Basic validation to ensure no empty products are created
    if (!title || !description || !price || !image) {
      return res.status(400).json({ message: 'Please provide all required product fields' });
    }

    // Create the product in MongoDB
    const product = await Product.create({
      vendor: req.user._id, // This ID is securely provided by your `protect` middleware!
      title,
      description,
      price,
      image,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};