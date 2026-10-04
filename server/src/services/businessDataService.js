import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

function dateRange(from, to) {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? range : undefined;
}

// Total revenue = sum of every sale's total, in the given window
export async function getRevenue(businessId, from, to) {
  const match = { business: new mongoose.Types.ObjectId(businessId) };
  const range = dateRange(from, to);
  if (range) match.createdAt = range;

  const [result] = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total" },
        saleCount: { $sum: 1 },
      },
    },
  ]);

  return { revenue: result?.revenue || 0, saleCount: result?.saleCount || 0 };
}

// COGS (Cost of Goods Sold) = for every item ever sold, costPriceAtSale × quantity.
// We use the snapshot stored on the sale, not today's product cost — a sale from
// last month must keep last month's true cost, even if the supplier price changed since.
export async function getCOGS(businessId, from, to) {
  const match = { business: new mongoose.Types.ObjectId(businessId) };
  const range = dateRange(from, to);
  if (range) match.createdAt = range;

  const [result] = await Sale.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: null,
        cogs: {
          $sum: { $multiply: ["$items.costPriceAtSale", "$items.quantity"] },
        },
      },
    },
  ]);

  return result?.cogs || 0;
}

// Total operating expenses in the window (rent, salary, utilities, etc.)
export async function getExpensesTotal(businessId, from, to) {
  const match = { business: new mongoose.Types.ObjectId(businessId) };
  const range = dateRange(from, to);
  if (range) match.date = range;

  const [result] = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result?.total || 0;
}

// Expense breakdown by category — feeds the dashboard pie chart (Day 16)
export async function getExpensesByCategory(businessId, from, to) {
  const match = { business: new mongoose.Types.ObjectId(businessId) };
  const range = dateRange(from, to);
  if (range) match.date = range;

  return Expense.aggregate([
    { $match: match },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);
}

// Daily sales totals — feeds the dashboard line chart (Day 16)
export async function getDailySales(businessId, from, to) {
  const match = { business: new mongoose.Types.ObjectId(businessId) };
  const range = dateRange(from, to);
  if (range) match.createdAt = range;

  return Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

// Cash flow: real money that moved, not accounting profit.
// Cash In  = cash actually received at sale time (excludes the customer_credit portion)
//            + standalone customer debt repayments made later.
// Cash Out = cash actually paid to suppliers at purchase time
//            + standalone supplier debt repayments made later
//            + all expenses (assumed paid in cash when recorded, for MVP simplicity).
export async function getCashFlow(businessId, from, to) {
  const businessObjId = new mongoose.Types.ObjectId(businessId);
  const range = dateRange(from, to);

  const saleMatch = { business: businessObjId };
  if (range) saleMatch.createdAt = range;

  const [cashInFromSales] = await Sale.aggregate([
    { $match: saleMatch },
    { $unwind: "$payments" },
    { $match: { "payments.method": { $ne: "customer_credit" } } },
    { $group: { _id: null, total: { $sum: "$payments.amount" } } },
  ]);

  const expensesTotal = await getExpensesTotal(businessId, from, to);

  const cashIn = cashInFromSales?.total || 0;
  const cashOut = expensesTotal; // purchase cash-out and standalone debt repayments can be added here as those pages mature

  return {
    cashIn,
    cashOut,
    netCashFlow: cashIn - cashOut,
  };
}

// The single call the Dashboard, Reports, and AI Advisor all share.
export async function getFinancialSummary(businessId, from, to) {
  const [{ revenue, saleCount }, cogs, expensesTotal, cashFlow] =
    await Promise.all([
      getRevenue(businessId, from, to),
      getCOGS(businessId, from, to),
      getExpensesTotal(businessId, from, to),
      getCashFlow(businessId, from, to),
    ]);

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expensesTotal;

  return {
    revenue,
    saleCount,
    cogs,
    grossProfit,
    operatingExpenses: expensesTotal,
    netProfit,
    cashFlow,
  };
}

// Inventory value "as of right now" — not time-windowed, since stock is a snapshot, not a period total
export async function getInventoryValue(businessId) {
  const products = await Product.find({ business: businessId, isActive: true });
  return products.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0);
}
import Customer from "../models/Customer.js";

// --- Date helpers for period comparisons ---
export function startOfThisMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfLastMonth() {
  const d = startOfThisMonth();
  d.setMonth(d.getMonth() - 1);
  return d;
}

export function endOfLastMonth() {
  const d = startOfThisMonth();
  d.setMilliseconds(-1); // one millisecond before this month started
  return d;
}

// How much NEW credit was handed out to customers in a given window —
// a rising number here means more sales are going unpaid, not necessarily lost,
// but it explains why cash and "paper profit" can tell different stories.
export async function getCustomerCreditIssued(businessId, from, to) {
  const match = { business: new mongoose.Types.ObjectId(businessId) };

  const [result] = await Customer.aggregate([
    { $match: match },
    { $unwind: "$ledger" },
    {
      $match: {
        "ledger.type": "purchase",
        "ledger.date": {
          $gte: new Date(from),
          ...(to ? { $lte: new Date(to) } : {}),
        },
      },
    },
    { $group: { _id: null, totalCreditIssued: { $sum: "$ledger.amount" } } },
  ]);

  return result?.totalCreditIssued || 0;
}

// Compares this month against last month across every number that can explain a profit change
export async function getPeriodComparison(businessId) {
  const thisStart = startOfThisMonth();
  const lastStart = startOfLastMonth();
  const lastEnd = endOfLastMonth();

  const [
    thisMonth,
    lastMonth,
    expensesThis,
    expensesLast,
    creditThis,
    creditLast,
    lowStock,
  ] = await Promise.all([
    getFinancialSummary(businessId, thisStart),
    getFinancialSummary(businessId, lastStart, lastEnd),
    getExpensesByCategory(businessId, thisStart),
    getExpensesByCategory(businessId, lastStart, lastEnd),
    getCustomerCreditIssued(businessId, thisStart),
    getCustomerCreditIssued(businessId, lastStart, lastEnd),
    Product.find({
      business: businessId,
      isActive: true,
      currentStock: 0,
    }).select("name"),
  ]);

  return {
    thisMonth: {
      revenue: thisMonth.revenue,
      cogs: thisMonth.cogs,
      netProfit: thisMonth.netProfit,
      operatingExpenses: thisMonth.operatingExpenses,
    },
    lastMonth: {
      revenue: lastMonth.revenue,
      cogs: lastMonth.cogs,
      netProfit: lastMonth.netProfit,
      operatingExpenses: lastMonth.operatingExpenses,
    },
    profitChange: thisMonth.netProfit - lastMonth.netProfit,
    revenueChange: thisMonth.revenue - lastMonth.revenue,
    expensesByCategoryThisMonth: expensesThis,
    expensesByCategoryLastMonth: expensesLast,
    customerCreditIssuedThisMonth: creditThis,
    customerCreditIssuedLastMonth: creditLast,
    currentlyOutOfStock: lowStock.map((p) => p.name),
  };
}
