import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { getAllForecasts } from "../services/forecastService.js";

// GET /api/inventory/forecast
export const getForecast = asyncHandler(async (req, res) => {
  const forecasts = await getAllForecasts(req.auth.business);
  res.json(forecasts);
});

// GET /api/inventory/movements — full history, newest first
export const getMovements = asyncHandler(async (req, res) => {
  const movements = await InventoryMovement.find({
    business: req.auth.business,
  })
    .populate("product", "name unit")
    .populate("performedBy", "name")
    .sort("-createdAt")
    .limit(200); // keep it fast; we'll add pagination later if needed

  res.json(movements);
});

// POST /api/inventory/stock-in — supplier delivery, increases stock
export const stockIn = asyncHandler(async (req, res) => {
  const { productId, quantity, reason } = req.body;

  if (!productId || !quantity || Number(quantity) <= 0) {
    res.status(400);
    throw new Error("productId and a positive quantity are required");
  }

  const product = await Product.findOne({
    _id: productId,
    business: req.auth.business,
  });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const previousStock = product.currentStock;
  product.currentStock += Number(quantity);
  await product.save();

  const movement = await InventoryMovement.create({
    business: req.auth.business,
    product: product._id,
    type: "stock_in",
    previousStock,
    change: Number(quantity),
    newStock: product.currentStock,
    reason: reason || "Stock received",
    performedBy: req.auth.id,
  });

  res.status(201).json({ product, movement });
});

// POST /api/inventory/adjust — damaged goods, recount correction, etc. (change can be + or -)
export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, change, reason } = req.body;

  if (!productId || change === undefined || Number(change) === 0) {
    res.status(400);
    throw new Error("productId and a non-zero change amount are required");
  }

  const product = await Product.findOne({
    _id: productId,
    business: req.auth.business,
  });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const previousStock = product.currentStock;
  const newStock = previousStock + Number(change);

  if (newStock < 0) {
    res.status(400);
    throw new Error(`Cannot reduce stock below 0 (current: ${previousStock})`);
  }

  product.currentStock = newStock;
  await product.save();

  const movement = await InventoryMovement.create({
    business: req.auth.business,
    product: product._id,
    type: "adjustment",
    previousStock,
    change: Number(change),
    newStock,
    reason: reason || "Manual adjustment",
    performedBy: req.auth.id,
  });

  res.status(201).json({ product, movement });
});
