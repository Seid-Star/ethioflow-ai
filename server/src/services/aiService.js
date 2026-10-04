import { GoogleGenAI } from "@google/genai";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Expense from "../models/Expense.js";
import {
  getFinancialSummary,
  getInventoryValue,
  getPeriodComparison,
} from "./businessDataService.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Step 1: Intent Detection ---
function detectIntent(question) {
  const q = question.toLowerCase();

  if (
    /why.*profit|profit decrease|revenue decrease|why.*revenue|compare.*month/.test(
      q,
    )
  )
    return "PROFIT_COMPARISON";
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

// --- Step 2: Business Data Service ---
async function gatherData(intent, businessId) {
  switch (intent) {
    case "PROFIT_COMPARISON": {
      return await getPeriodComparison(businessId);
    }

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

// --- Step 3: LLM composes the natural-language response, with retry on temporary overload ---
async function composeAnswer(question, intent, data) {
  const systemPrompt = `You are EthioFlow AI, a business advisor for an Ethiopian small shop owner.
Rules:
- ONLY use the numbers given to you in the DATA block below. Never invent, estimate, or guess any figure.
- Currency is always ETB.
- Give a complete, useful answer: state the direct answer first, then back it up with the specific numbers from DATA, then end with one clear, concrete recommendation.
- Write 4-6 sentences. Do not cut the answer short — finish every thought completely.
- If DATA includes a list (debtors, low-stock products, expense categories), mention the top 2-3 by name with their numbers, not just a vague summary.
- If DATA contains "thisMonth" and "lastMonth": if lastMonth's revenue AND netProfit are both exactly 0, say plainly that there isn't enough data from last month yet to make a real comparison, briefly state this month's actual numbers instead, and stop there — do not calculate a "decrease" against an empty baseline. Otherwise, name the specific drivers: compare expense categories between the two periods and name which one grew most, compare customerCreditIssued between the two periods, and mention currentlyOutOfStock products only as a present-tense fact ("X is currently out of stock"), never claim it was out of stock last month unless the data says so.
- Get straight to the point. No preamble like "Sure, let me check" or "Based on the data provided".
- Do not mention "intent detection", "database", or anything technical.`;

  const userPrompt = `Owner's question: "${question}"
Detected intent: ${intent}
DATA (the only facts you may use):
${JSON.stringify(data, null, 2)}`;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 800,
          temperature: 0.4,
        },
      });
      return response.text;
    } catch (err) {
      const isOverloaded = err?.status === 503;
      const isLastAttempt = attempt === maxAttempts;

      if (isOverloaded && !isLastAttempt) {
        console.warn(
          `⚠ Gemini overloaded (attempt ${attempt}/${maxAttempts}), retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }

      throw err;
    }
  }
}

// --- The full pipeline ---
export async function answerQuestion(businessId, question) {
  const intent = detectIntent(question);
  const data = await gatherData(intent, businessId);
  const reply = await composeAnswer(question, intent, data);
  return { intent, data, reply };
}
