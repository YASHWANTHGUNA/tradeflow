import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Log in to Cloudinary using your .env keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer to hold the uploaded file in server memory (RAM)
// We do this so we don't have to save junk files to your local hard drive
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export { cloudinary };