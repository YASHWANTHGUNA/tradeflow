// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // Added Auth Routes Import
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json()); // Allows parsing JSON request bodies

// Mount API Routes
app.use('/api/auth', authRoutes); // Auth endpoints now active

app.use('/api/products', productRoutes);


app.use('/api/payments', paymentRoutes);


// Simple Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TradeFlow API is running smoothly' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is operating on port ${PORT}`);
});