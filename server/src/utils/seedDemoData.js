import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const DEMO_EMAIL = "abebe@demo.ethioflow.ai";

async function seed() {
  await connectDB();

  console.log("🧹 Clearing previous demo data...");
  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    await Product.deleteMany({ business: existingUser.business });
    await User.deleteOne({ _id: existingUser._id });
    await Business.deleteOne({ _id: existingUser.business });
  }

  console.log("🏪 Creating Abebe General Store...");
  const business = await Business.create({
    name: "Abebe General Store",
    type: "General Merchant",
    currency: "ETB",
    branches: [{ name: "Main Branch", isMain: true }],
  });

  const owner = await User.create({
    business: business._id,
    name: "Abebe Kebede",
    email: DEMO_EMAIL,
    phone: "0911000000",
    password: "Demo1234",
    role: "owner",
  });

  console.log("📦 Creating demo products...");
  const products = [
    {
      name: "Cooking Oil",
      costPrice: 180,
      sellingPrice: 220,
      currentStock: 45,
      minStock: 15,
      unit: "liter",
    },
    {
      name: "Sugar",
      costPrice: 60,
      sellingPrice: 75,
      currentStock: 90,
      minStock: 20,
      unit: "kg",
    },
    {
      name: "Flour",
      costPrice: 50,
      sellingPrice: 65,
      currentStock: 70,
      minStock: 20,
      unit: "kg",
    },
    {
      name: "Soap",
      costPrice: 25,
      sellingPrice: 35,
      currentStock: 120,
      minStock: 30,
      unit: "pcs",
    },
    {
      name: "Milk",
      costPrice: 40,
      sellingPrice: 50,
      currentStock: 8,
      minStock: 15,
      unit: "liter",
    }, // intentionally low
    {
      name: "Coffee",
      costPrice: 200,
      sellingPrice: 260,
      currentStock: 35,
      minStock: 10,
      unit: "kg",
    },
    {
      name: "Biscuits",
      costPrice: 15,
      sellingPrice: 22,
      currentStock: 150,
      minStock: 40,
      unit: "pcs",
    },
  ];

  await Product.insertMany(
    products.map((p) => ({ ...p, business: business._id })),
  );

  console.log("\n✅ Demo data ready!");
  console.log(`   Business: ${business.name}`);
  console.log(`   Login:    ${DEMO_EMAIL} / Demo1234`);
  console.log(
    `   Products: ${products.length} (Milk is intentionally below min stock)`,
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
