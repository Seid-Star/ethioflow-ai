import asyncHandler from "express-async-handler";
import {
  getFinancialSummary,
  getDailySales,
  getExpensesByCategory,
  getInventoryValue,
} from "../services/businessDataService.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";

// GET /api/reports/sales?from=&to=
export const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { business: req.auth.business };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const sales = await Sale.find(filter)
    .populate("cashier", "name")
    .populate("customer", "name")
    .sort("-createdAt");

  res.json(
    sales.map((s) => ({
      id: s._id,
      date: s.createdAt,
      cashier: s.cashier?.name || "—",
      customer: s.customer?.name || "Walk-in",
      itemCount: s.items.length,
      subtotal: s.subtotal,
      discount: s.discount,
      tax: s.tax,
      total: s.total,
      paymentMethod: s.paymentMethod,
    })),
  );
});

// GET /api/reports/inventory
export const inventoryReport = asyncHandler(async (req, res) => {
  const products = await Product.find({
    business: req.auth.business,
    isActive: true,
  }).sort("name");

  res.json(
    products.map((p) => ({
      name: p.name,
      sku: p.sku || "—",
      currentStock: p.currentStock,
      minStock: p.minStock,
      status: p.currentStock <= p.minStock ? "Low Stock" : "OK",
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stockValue: p.costPrice * p.currentStock,
    })),
  );
});

// GET /api/reports/customers
export const customerReport = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ business: req.auth.business })
    .select("name phone totalPurchased totalPaid outstandingBalance")
    .sort("-outstandingBalance");

  res.json(
    customers.map((c) => ({
      name: c.name,
      phone: c.phone || "—",
      totalPurchased: c.totalPurchased,
      totalPaid: c.totalPaid,
      outstandingBalance: c.outstandingBalance,
    })),
  );
});

// GET /api/reports/suppliers
export const supplierReport = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ business: req.auth.business })
    .select("name phone totalPurchased totalPaid outstandingBalance")
    .sort("-outstandingBalance");

  res.json(
    suppliers.map((s) => ({
      name: s.name,
      phone: s.phone || "—",
      totalPurchased: s.totalPurchased,
      totalPaid: s.totalPaid,
      outstandingBalance: s.outstandingBalance,
    })),
  );
});

// GET /api/reports/financial-summary?from=&to=
export const financialSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const summary = await getFinancialSummary(req.auth.business, from, to);
  const inventoryValue = await getInventoryValue(req.auth.business);
  res.json({ ...summary, inventoryValue });
});

// GET /api/reports/daily-sales?from=&to=
export const dailySales = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await getDailySales(req.auth.business, from, to);
  res.json(data);
});

// GET /api/reports/expenses-by-category?from=&to=
export const expensesByCategory = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await getExpensesByCategory(req.auth.business, from, to);
  res.json(data);
});
