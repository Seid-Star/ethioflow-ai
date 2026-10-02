import asyncHandler from "express-async-handler";
import Supplier from "../models/Supplier.js";

// GET /api/suppliers
export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ business: req.auth.business })
    .select("name phone address totalPurchased totalPaid outstandingBalance")
    .sort("-outstandingBalance");
  res.json(suppliers);
});

// GET /api/suppliers/:id
export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json(supplier);
});

// POST /api/suppliers
export const createSupplier = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Supplier name is required");
  }
  const supplier = await Supplier.create({
    business: req.auth.business,
    name,
    phone,
    address,
  });
  res.status(201).json(supplier);
});

// PUT /api/suppliers/:id
export const updateSupplier = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    { name, phone, address },
    { new: true, runValidators: true },
  );
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json(supplier);
});

// POST /api/suppliers/:id/payments — pay down what you owe them
export const recordSupplierPayment = asyncHandler(async (req, res) => {
  const { amount, note } = req.body;

  if (!amount || Number(amount) <= 0) {
    res.status(400);
    throw new Error("A positive payment amount is required");
  }

  const supplier = await Supplier.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  if (Number(amount) > supplier.outstandingBalance) {
    res.status(400);
    throw new Error(
      `Payment (${amount} ETB) exceeds what you owe (${supplier.outstandingBalance} ETB)`,
    );
  }

  supplier.recordEntry({
    type: "payment",
    amount: Number(amount),
    note: note || "Payment sent",
  });
  await supplier.save();

  res.json(supplier);
});
