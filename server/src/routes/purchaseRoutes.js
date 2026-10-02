import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createPurchase,
  getPurchases,
} from "../controllers/purchaseController.js";

const router = Router();
router.use(protect);

router.get("/", getPurchases);
router.post("/", authorize("owner", "manager"), createPurchase);

export default router;
