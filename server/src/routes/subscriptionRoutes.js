import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getSubscription,
  getInvoices,
  checkout,
  cancel,
} from "../controllers/subscriptionController.js";

const router = Router();
router.use(protect);

router.get("/", getSubscription);
router.get("/invoices", getInvoices);
router.post("/checkout", authorize("owner"), checkout);
router.post("/cancel", authorize("owner"), cancel);

export default router;
