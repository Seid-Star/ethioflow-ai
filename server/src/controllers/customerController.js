import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";

// GET /api/customers
export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ business: req.auth.business })
    .select(
      "name phone address totalPurchased totalPaid outstandingBalance createdAt",
    )
    .sort("-outstandingBalance");
  res.json(customers);
});

// GET /api/customers/:id — full profile with ledger
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json(customer);
});

// POST /api/customers
export const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Customer name is required");
  }
  const customer = await Customer.create({
    business: req.auth.business,
    name,
    phone,
    address,
  });
  res.status(201).json(customer);
});

// PUT /api/customers/:id
export const updateCustomer = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    { name, phone, address },
    { new: true, runValidators: true },
  );
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json(customer);
});

// POST /api/customers/:id/payments — record a payment against the customer's debt
export const recordPayment = asyncHandler(async (req, res) => {
  const { amount, note } = req.body;

  if (!amount || Number(amount) <= 0) {
    res.status(400);
    throw new Error("A positive payment amount is required");
  }

  const customer = await Customer.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  if (Number(amount) > customer.outstandingBalance) {
    res.status(400);
    throw new Error(
      `Payment (${amount} ETB) exceeds the outstanding balance (${customer.outstandingBalance} ETB)`,
    );
  }

  customer.recordEntry({
    type: "payment",
    amount: Number(amount),
    note: note || "Payment received",
  });
  await customer.save();

  res.json(customer);
});

// GET /api/customers/summary/debt — feeds the dashboard's credit KPIs
export const getDebtSummary = asyncHandler(async (req, res) => {
  const customers = await Customer.find({
    business: req.auth.business,
    outstandingBalance: { $gt: 0 },
  }).select("outstandingBalance");

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + c.outstandingBalance,
    0,
  );
  const customersWithDebt = customers.length;

  res.json({ totalOutstanding, customersWithDebt });
});
