import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  recordPayment,
  getDebtSummary,
} from "../controllers/customerController.js";

const router = Router();

router.use(protect);

router.get("/", getCustomers);
router.get("/summary/debt", getDebtSummary);
router.get("/:id", getCustomer);
router.post("/", authorize("owner", "manager", "cashier"), createCustomer);
router.put("/:id", authorize("owner", "manager"), updateCustomer);
router.post(
  "/:id/payments",
  authorize("owner", "manager", "cashier", "accountant"),
  recordPayment,
);

export default router;
