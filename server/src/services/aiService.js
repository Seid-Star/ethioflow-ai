import { GoogleGenAI } from "@google/genai";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Expense from "../models/Expense.js";
import {
  getFinancialSummary,
  getInventoryValue,
} from "./businessDataService.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// --- Step 1: Intent Detection (keyword-based, matches the spec's "Intent Detection" box) ---
function detectIntent(question) {
  const q = question.toLowerCase();

  if (/sales today|today'?s sales|how much.*sell.*today|sold today/.test(q))
    return "TODAY_SALES";
  if (/who owes|outstanding|overdue|owing me|debt/.test(q))
    return "CUSTOMER_DEBT";
  if (/restock|running low|low stock|should i order|out of stock/.test(q))
    return "RESTOCK";
  if (/biggest expense|spend the most|expenses/.test(q))
    return "BIGGEST_EXPENSES";
  if (/profit|doing financially|how am i doing|net profit/.test(q))
    return "PROFIT_SUMMARY";

  return "GENERAL";
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// --- Step 2: Business Data Service — fetch ONLY the real numbers each intent needs ---
async function gatherData(intent, businessId) {
  switch (intent) {
    case "TODAY_SALES": {
      const summary = await getFinancialSummary(businessId, startOfToday());
      return { revenue: summary.revenue, saleCount: summary.saleCount };
    }

    case "CUSTOMER_DEBT": {
      const customers = await Customer.find({
        business: businessId,
        outstandingBalance: { $gt: 0 },
      })
        .select("name outstandingBalance")
        .sort("-outstandingBalance")
        .limit(10);
      const total = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
      return {
        totalOutstanding: total,
        customerCount: customers.length,
        topDebtors: customers.map((c) => ({
          name: c.name,
          owes: c.outstandingBalance,
        })),
      };
    }

    case "RESTOCK": {
      const lowStock = await Product.find({
        business: businessId,
        isActive: true,
        $expr: { $lte: ["$currentStock", "$minStock"] },
      }).select("name currentStock minStock");
      return {
        lowStockProducts: lowStock.map((p) => ({
          name: p.name,
          stock: p.currentStock,
          minStock: p.minStock,
        })),
      };
    }

    case "BIGGEST_EXPENSES": {
      const expenses = await Expense.find({
        business: businessId,
        date: { $gte: startOfMonth() },
      });
      const byCategory = {};
      for (const e of expenses)
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
      return {
        thisMonthExpenses: sorted.map(([category, amount]) => ({
          category,
          amount,
        })),
      };
    }

    case "PROFIT_SUMMARY": {
      const summary = await getFinancialSummary(businessId, startOfMonth());
      const inventoryValue = await getInventoryValue(businessId);
      return { ...summary, inventoryValue, period: "this month" };
    }

    default: {
      const summary = await getFinancialSummary(businessId, startOfMonth());
      return {
        ...summary,
        period: "this month",
        note: "General business snapshot",
      };
    }
  }
}

async function composeAnswer(question, intent, data) {
  const systemPrompt = `You are EthioFlow AI, a business advisor for an Ethiopian small shop owner.
Rules:
- ONLY use the numbers given to you in the DATA block below. Never invent, estimate, or guess any figure.
- Currency is always ETB.
- Keep the answer to 2-4 short sentences, friendly and plain-language, like talking to a shop owner, not an accountant.
- If the data shows a problem (debt, low stock, low profit), end with one short, concrete recommendation.
- Do not mention "intent detection", "database", or anything technical.`;

  const userPrompt = `Owner's question: "${question}"
Detected intent: ${intent}
DATA (the only facts you may use):
${JSON.stringify(data, null, 2)}`;

  const response = await genAI.models.generateContent({
    model: "gemini-flash-latest",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 300,
    },
  });

  return response.text;
}

// --- The full pipeline, called by the controller ---
export async function answerQuestion(businessId, question) {
  const intent = detectIntent(question);
  const data = await gatherData(intent, businessId);
  const reply = await composeAnswer(question, intent, data);
  return { intent, data, reply };
}
