import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createSale,
  getSales,
  getSale,
} from "../controllers/saleController.js";

const router = Router();

router.use(protect);

router.post("/", authorize("owner", "manager", "cashier"), createSale);
router.get("/", getSales);
router.get("/:id", getSale);

export default router;
