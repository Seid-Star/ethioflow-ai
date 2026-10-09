import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  recordPayment,
  getDebtSummary,
  addNote,
} from "../controllers/customerController.js";
import { validateCustomer, validatePayment } from "../validators/index.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);
router.post(
  "/",
  authorize("owner", "manager", "cashier"),
  validateCustomer,
  validate,
  createCustomer,
);
router.post(
  "/:id/payments",
  authorize("owner", "manager", "cashier", "accountant"),
  validatePayment,
  validate,
  recordPayment,
);
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
router.post("/:id/notes", authorize("owner", "manager", "cashier"), addNote);

export default router;
