import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: ["https://tradeflow-peach.vercel.app",
    "https://tradeflowapp.me",
    "https://www.tradeflowapp.me",
    "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// Base endpoints mounted
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes); // Handshake prefix handler
app.use('/api/users', userRoutes);
app.use("/api/orders", orderRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TradeFlow API is running smoothly' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is operating on port ${PORT}`);
});
