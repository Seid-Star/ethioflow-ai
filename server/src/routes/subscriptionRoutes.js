import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getSubscription,
  getInvoices,
  checkout,
  verifyPayment,
  chapaWebhook,
  cancel,
} from "../controllers/subscriptionController.js";

const router = Router();
router.post("/webhook", chapaWebhook);

router.use(protect);

router.get("/", getSubscription);
router.get("/invoices", getInvoices);
router.post("/checkout", authorize("owner"), checkout);
router.post("/verify", verifyPayment);
router.post("/cancel", authorize("owner"), cancel);

export default router;
