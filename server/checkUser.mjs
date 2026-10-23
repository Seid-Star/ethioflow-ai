import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import User from "./src/models/User.js";

try {
  await connectDB();

  const user = await User.findOne({
    email: "sjrd02911@gmail.com",
  }).select("name email isPlatformAdmin status emailVerified");

  console.log(user ? user.toObject() : "ACCOUNT NOT FOUND");
} catch (error) {
  console.error("Diagnostic failed:", error.message);
} finally {
  await mongoose.disconnect();
}
