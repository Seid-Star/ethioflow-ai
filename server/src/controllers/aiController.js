import asyncHandler from "express-async-handler";
import { answerQuestion } from "../services/aiService.js";

// POST /api/ai/ask
export const askAI = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    res.status(400);
    throw new Error("A question is required");
  }

  try {
    const result = await answerQuestion(req.auth.business, question.trim());
    res.json(result);
  } catch (err) {
    console.error("❌ AI Advisor error:", err); // full stack, straight to your terminal
    res.status(500);
    throw new Error(err.message || "AI Advisor failed to answer");
  }
});
