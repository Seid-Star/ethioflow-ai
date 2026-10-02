import asyncHandler from "express-async-handler";
import {
  getFinancialSummary,
  getDailySales,
  getExpensesByCategory,
  getInventoryValue,
} from "../services/businessDataService.js";

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
