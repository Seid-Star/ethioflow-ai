import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Customer from "../models/Customer.js";
import Expense from "../models/Expense.js";
const DEMO_EMAIL = "abebe@demo.ethioflow.ai";
async function generateSalesHistory(business, owner, products) {
  console.log("💰 Generating 30 days of sale history...");

  const productMap = {};
  for (const p of products) productMap[p.name] = p;

  const customer = await Customer.create({
    business: business._id,
    name: "Hana Tesfaye",
    phone: "0922111111",
  });

  const today = new Date();

  for (let daysBack = 29; daysBack >= 0; daysBack--) {
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - daysBack);

    // 1-3 sales per day, skip some days entirely for realism
    const salesToday = Math.random() > 0.15 ? Math.ceil(Math.random() * 3) : 0;

    for (let s = 0; s < salesToday; s++) {
      const itemCount = 1 + Math.floor(Math.random() * 2);
      const chosenProducts = Object.values(productMap)
        .sort(() => 0.5 - Math.random())
        .slice(0, itemCount);

      const saleItems = [];
      let subtotal = 0;

      for (const product of chosenProducts) {
        const freshProduct = await Product.findById(product._id);
        const quantity = 1 + Math.floor(Math.random() * 3);
        if (freshProduct.currentStock < quantity) continue;

        const previousStock = freshProduct.currentStock;
        freshProduct.currentStock -= quantity;
        await freshProduct.save();

        await InventoryMovement.create({
          business: business._id,
          product: freshProduct._id,
          type: "sale",
          previousStock,
          change: -quantity,
          newStock: freshProduct.currentStock,
          reason: "POS sale",
          performedBy: owner._id,
          createdAt: saleDate,
        });

        const lineTotal = freshProduct.sellingPrice * quantity;
        subtotal += lineTotal;
        saleItems.push({
          product: freshProduct._id,
          name: freshProduct.name,
          quantity,
          unitPrice: freshProduct.sellingPrice,
          costPriceAtSale: freshProduct.costPrice,
          lineTotal,
        });
      }

      if (saleItems.length === 0) continue;

      const useCreditSale = Math.random() > 0.8;
      const total = subtotal;

      const sale = await Sale.create({
        business: business._id,
        cashier: owner._id,
        customer: useCreditSale ? customer._id : undefined,
        items: saleItems,
        subtotal,
        discount: 0,
        tax: 0,
        total,
        payments: [
          { method: useCreditSale ? "customer_credit" : "cash", amount: total },
        ],
        paymentMethod: useCreditSale ? "customer_credit" : "cash",
        amountPaid: total,
        createdAt: saleDate,
      });

      if (useCreditSale) {
        customer.recordEntry({
          type: "purchase",
          amount: total,
          note: "POS sale",
          relatedSale: sale._id,
        });
        await customer.save();
      }

      // Backdate createdAt manually since Mongoose timestamps override it on create
      await Sale.updateOne({ _id: sale._id }, { createdAt: saleDate });
    }

    // One expense every ~5 days
    if (daysBack % 5 === 0) {
      const categories = ["Rent", "Electricity", "Transport", "Internet"];
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const amount =
        category === "Rent" ? 5000 : 300 + Math.floor(Math.random() * 1000);
      await Expense.create({
        business: business._id,
        category,
        amount,
        date: saleDate,
        recordedBy: owner._id,
      });
    }
  }

  console.log("✅ Sales history generated");
}

async function seed() {
  await connectDB();

  console.log("🧹 Clearing previous demo data...");
  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    await Sale.deleteMany({ business: existingUser.business });
    await InventoryMovement.deleteMany({ business: existingUser.business });
    await Customer.deleteMany({ business: existingUser.business });
    await Expense.deleteMany({ business: existingUser.business });
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

  const createdProducts = await Product.insertMany(
    products.map((p) => ({ ...p, business: business._id })),
  );

  await generateSalesHistory(business, owner, createdProducts);

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
