import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

async function test() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://mail2yashwanth2004_db_user:TLQewkCuNm8BDhIi@cluster0.ofzll9r.mongodb.net/tradeflow?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!");

    // Check if there are any users
    const users = await User.find({});
    console.log(`Found ${users.length} user(s) in the database:`);
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Password Length/Hash: ${u.password ? u.password.length : 0}`);
    });

    // Try saving a test user
    const testEmail = `test_${Date.now()}@example.com`;
    const tempUser = new User({
      name: "Test User",
      email: testEmail,
      password: "password123",
      role: "customer"
    });

    console.log("Saving test user...");
    await tempUser.save();
    console.log("Test user saved successfully!");

    // Query back the test user to verify password hashing
    const savedUser = await User.findOne({ email: testEmail });
    console.log("Saved user password hash:", savedUser.password);
    const isMatch = await savedUser.comparePassword("password123");
    console.log("Password compare check with correct password:", isMatch);
    const isNotMatch = await savedUser.comparePassword("wrong_password");
    console.log("Password compare check with wrong password:", isNotMatch);

    // Clean up
    await User.deleteOne({ email: testEmail });
    console.log("Cleaned up test user.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

test();
