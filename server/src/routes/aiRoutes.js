import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { askAI, getHistory } from "../controllers/aiController.js";

const router = Router();
router.use(protect);

router.post("/ask", askAI);
router.get("/history", getHistory);

export default router;
