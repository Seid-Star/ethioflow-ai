import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

// GET /api/dashboard/summary
export const getSummary = asyncHandler(async (req, res) => {
  const products = await Product.find({
    business: req.auth.business,
    isActive: true,
  });

  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.costPrice * p.currentStock,
    0,
  );
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStock,
  ).length;

  res.json({
    totalProducts,
    totalInventoryValue,
    lowStockCount,
  });
});
