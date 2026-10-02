import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

// GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    business: req.auth.business,
    isActive: true,
  }).sort("-createdAt");
  res.json(products);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    business: req.auth.business,
  });
  res.status(201).json(product);
});

// PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    req.body,
    { new: true, runValidators: true },
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// DELETE /api/products/:id — soft delete, keeps history intact
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    { isActive: false },
    { new: true },
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(204).send();
});
