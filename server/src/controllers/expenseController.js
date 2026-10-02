import asyncHandler from "express-async-handler";
import Expense from "../models/Expense.js";

// GET /api/expenses — optionally filter by ?from=&to= (ISO dates)
export const getExpenses = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { business: req.auth.business };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const expenses = await Expense.find(filter)
    .populate("recordedBy", "name")
    .sort("-date");
  res.json(expenses);
});

// POST /api/expenses
export const createExpense = asyncHandler(async (req, res) => {
  const { category, amount, note, date } = req.body;

  if (!category || !amount || Number(amount) <= 0) {
    res.status(400);
    throw new Error("Category and a positive amount are required");
  }

  const expense = await Expense.create({
    business: req.auth.business,
    category,
    amount: Number(amount),
    note,
    date: date || new Date(),
    recordedBy: req.auth.id,
  });

  res.status(201).json(expense);
});

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.status(204).send();
});

// GET /api/expenses/summary/today — feeds the dashboard KPI on Day 16
export const getTodaySummary = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const expenses = await Expense.find({
    business: req.auth.business,
    date: { $gte: startOfDay },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ total, count: expenses.length });
});
