import { GoogleGenAI } from "@google/genai";
import Customer from "../models/Customer.js";
import Expense from "../models/Expense.js";
import {
  getFinancialSummary,
  getInventoryValue,
  getPeriodComparison,
} from "./businessDataService.js";
import { getAllForecasts } from "./forecastService.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Step 1: Intent detection (English and Amharic) ---
function detectIntent(question) {
  const q = question.toLowerCase().trim();

  if (
    /why.*profit|profit decrease|revenue decrease|why.*revenue|compare.*month/.test(
      q,
    ) ||
    /ለምን.*(ትር[ፍፌ]|ገቢ)|(ትር[ፍፌ]|ገቢ).*(ቀነሰ|ወረደ)/.test(q)
  )
    return "PROFIT_COMPARISON";

  if (
    /sales today|today'?s sales|how much.*sell.*today|sold today/.test(q) ||
    /ዛሬ.*(ሽያጭ|ሽያጬ|ሸጥ)|(ሽያጭ|ሽያጬ).*ዛሬ|የዛሬ.*(ሽያጭ|ሽያጬ)/.test(q)
  )
    return "TODAY_SALES";

  if (
    /who owes|outstanding|overdue|owing me|debt/.test(q) ||
    /ዕዳ|እዳ|ብድር|የሚበደሩ|ያልከፈሉ|ማን.*(ብር|ገንዘብ)/.test(q)
  )
    return "CUSTOMER_DEBT";

  if (
    /restock|running low|low stock|should i order|out of stock/.test(q) ||
    /ማስገባት|ልግዛ|ማዘዝ|አልቋል|ሊያልቅ|ማሟላት|ክምችት/.test(q)
  )
    return "RESTOCK";

  if (/biggest expense|spend the most|expenses/.test(q) || /ወጪ/.test(q))
    return "BIGGEST_EXPENSES";

  if (
    /profit|doing financially|how am i doing|net profit/.test(q) ||
    /ትር[ፍፌ]/.test(q)
  )
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

// --- Step 2: Business Data Service: fetch only the real numbers each intent needs ---
async function gatherData(intent, businessId) {
  switch (intent) {
    case "PROFIT_COMPARISON":
      return await getPeriodComparison(businessId);

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
      const forecasts = await getAllForecasts(businessId);
      const needsAttention = forecasts.filter(
        (f) =>
          f.status === "critical" ||
          f.status === "warning" ||
          f.status === "low_stock_no_velocity",
      );
      return { restockForecasts: needsAttention };
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

// --- Step 3: The model explains the real numbers in plain language ---

async function composeAnswer(question, intent, data) {
  const SYSTEM_PROMPT = `You are EthioFlow AI, a business advisor for an Ethiopian small shop owner.
Rules:
- ONLY use the numbers given to you in the DATA block below. Never invent, estimate, or guess any figure.
- Currency is always ETB.
- Reply in the same language the owner's question is written in (English or Amharic). In Amharic, write the currency as ብር, and write complete, natural sentences.
- Give a complete, useful answer: state the direct answer first, then back it up with the specific numbers from DATA, then end with one clear, concrete recommendation.
- Keep it to about four to six sentences, and finish every sentence.
- If DATA includes a list (debtors, low-stock products, expense categories), mention the top 2-3 by name with their numbers, not just a vague summary.
- If DATA contains "thisMonth" and "lastMonth": if lastMonth's revenue AND netProfit are both exactly 0, say plainly that there isn't enough data from last month yet to make a real comparison, briefly state this month's actual numbers instead, and stop there. Do not calculate a "decrease" against an empty baseline. Otherwise, name the specific drivers: compare expense categories between the two periods and name which one grew most, compare customerCreditIssued between the two periods, and mention currentlyOutOfStock products only as a present-tense fact ("X is currently out of stock"), never claim it was out of stock last month unless the data says so.
- Get straight to the point. No preamble like "Sure, let me check" or "Based on the data provided".
- Your whole reply is the final answer and nothing else: no notes, drafts, headings, labels such as "(Recommendation)", sentence counts, or comments about these rules.
- Do not use markdown, bullet points, or symbols, because your answer may be read aloud.
- Do not mention "intent detection", "database", or anything technical.`;

  async function callGemini(userPrompt, maxOutputTokens) {
    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens,
        temperature: 0.4,
      },
    });

    return {
      text: (response.text || "").trim(),
      finishReason: response.candidates?.[0]?.finishReason,
    };
  }

  async function generateWithRetry(userPrompt, maxOutputTokens) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await callGemini(userPrompt, maxOutputTokens);
      } catch (err) {
        if (err?.status === 503 && attempt < maxAttempts) {
          console.warn(
            `⚠ Gemini overloaded (attempt ${attempt}/${maxAttempts}), retrying...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, attempt * 1000)
          );

          continue;
        }

        throw err;
      }
    }

    throw new Error("AI service is temporarily unavailable.");
  }

  const userPrompt = `Owner's question: "${question}"
Detected intent: ${intent}
DATA (the only facts you may use):
${JSON.stringify(data, null, 2)}`;

  let result = await generateWithRetry(userPrompt, 4096);

  if (result.finishReason === "MAX_TOKENS" || !result.text) {
    console.warn(
      `⚠ Answer incomplete or empty (${result.finishReason}), retrying...`
    );

    result = await generateWithRetry(userPrompt, 8192);
  }

  if (!result.text || result.finishReason === "MAX_TOKENS") {
    throw new Error("I could not finish that answer. Please ask again.");
  }

  return result.text;
}


// --- The full pipeline ---
export async function answerQuestion(businessId, question) {
  const intent = detectIntent(question);
  const data = await gatherData(intent, businessId);
  const reply = await composeAnswer(question, intent, data);
  return { intent, data, reply };
}
