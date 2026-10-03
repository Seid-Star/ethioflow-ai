import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { askAI } from "../controllers/aiController.js";

const router = Router();
router.use(protect);

router.post("/ask", askAI);

export default router;
