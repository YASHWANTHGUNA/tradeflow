// server/controllers/productController.js
import Product from '../models/Product.js';
import { cloudinary } from '../config/cloudinary.js';

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
export const uploadProductImage = async (req, res) => {
  try {
    // Check if a file actually came through
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // Convert the memory buffer into a base64 string that Cloudinary can read
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "tradeflow_products", // Creates a neat folder in your Cloudinary account
    });

    // Send the secure Cloudinary URL back to the frontend
    res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
};
export const getProducts = async (req, res) => {
  try {
    // Fetch all products, sorted by newest first
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: 'Server Error: Could not fetch products' });
  }
};

export const getMerchantProducts = async (req, res) => {
  try {
    // req.user._id is provided securely by your protect middleware
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Ledger Fetch Error:", error);
    res.status(500).json({ message: 'Server Error: Could not fetch merchant ledger' });
  }
};
