import asyncHandler from "express-async-handler";
import { answerQuestion } from "../services/aiService.js";
import AIMessage from "../models/AIMessage.js";

// POST /api/ai/ask
export const askAI = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    res.status(400);
    throw new Error("A question is required");
  }

  try {
    const result = await answerQuestion(req.auth.business, question.trim());

    await AIMessage.create({
      business: req.auth.business,
      user: req.auth.id,
      question: question.trim(),
      intent: result.intent,
      reply: result.reply,
    });

    res.json(result);
  } catch (err) {
    console.error("❌ AI Advisor error:", err);

    // Google's servers being temporarily overloaded is not our bug — say so plainly
    if (err.status === 503 || err.status === 429) {
      return res.status(503).json({
        message:
          "The AI service is a bit busy right now. Please try again in a moment.",
      });
    }

    res.status(500);
    throw new Error(err.message || "AI Advisor failed to answer");
  }
});

// GET /api/ai/history
export const getHistory = asyncHandler(async (req, res) => {
  const messages = await AIMessage.find({ business: req.auth.business })
    .populate("user", "name")
    .sort("-createdAt")
    .limit(100);

  res.json(messages);
});
