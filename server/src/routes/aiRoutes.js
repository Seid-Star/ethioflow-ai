import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { askAI, getHistory } from "../controllers/aiController.js";

const router = Router();
router.use(protect);

router.post("/ask", askAI);
router.get("/history", getHistory);
import rateLimit from "express-rate-limit";

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: {
    message: "Too many AI questions in a short time. Please wait a moment.",
  },
});
router.post("/ask", aiLimiter, askAI);
export default router;
