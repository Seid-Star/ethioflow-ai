import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  financialSummary,
  dailySales,
  expensesByCategory,
} from "../controllers/reportController.js";

const router = Router();
router.use(protect);

router.get("/financial-summary", financialSummary);
router.get("/daily-sales", dailySales);
router.get("/expenses-by-category", expensesByCategory);

export default router;
