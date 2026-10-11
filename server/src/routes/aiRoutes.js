import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import { askAI, getHistory } from "../controllers/aiController.js";

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: {
    message: "Too many AI questions in a short time. Please wait a moment.",
  },
});

const router = Router();
router.use(protect);

router.post(
  "/ask",
  aiLimiter,
  requirePlan("professional", "The AI Business Advisor"),
  askAI,
);
router.get("/history", getHistory);

export default router;
