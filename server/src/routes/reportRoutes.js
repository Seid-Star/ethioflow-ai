import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  financialSummary,
  dailySales,
  expensesByCategory,
  salesReport,
  inventoryReport,
  customerReport,
  supplierReport,
} from "../controllers/reportController.js";

const router = Router();
router.use(protect);

router.get("/financial-summary", financialSummary);
router.get("/daily-sales", dailySales);
router.get("/expenses-by-category", expensesByCategory);
router.get("/sales", salesReport);
router.get("/inventory", inventoryReport);
router.get("/customers", customerReport);
router.get("/suppliers", supplierReport);

export default router;
