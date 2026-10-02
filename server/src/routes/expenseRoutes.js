import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getTodaySummary,
} from "../controllers/expenseController.js";

const router = Router();
router.use(protect);

router.get("/", getExpenses);
router.get("/summary/today", getTodaySummary);
router.post("/", authorize("owner", "manager", "accountant"), createExpense);
router.delete(
  "/:id",
  authorize("owner", "manager", "accountant"),
  deleteExpense,
);

export default router;
