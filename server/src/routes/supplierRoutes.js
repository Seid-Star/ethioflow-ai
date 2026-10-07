import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  recordSupplierPayment,
} from "../controllers/supplierController.js";
import { validateSupplier, validatePayment } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
const router = Router();
router.use(protect);
router.post(
  "/",
  authorize("owner", "manager"),
  validateSupplier,
  validate,
  createSupplier,
);
router.post(
  "/:id/payments",
  authorize("owner", "manager", "accountant"),
  validatePayment,
  validate,
  recordSupplierPayment,
);
router.get("/", getSuppliers);
router.get("/:id", getSupplier);
router.post("/", authorize("owner", "manager"), createSupplier);
router.put("/:id", authorize("owner", "manager"), updateSupplier);
router.post(
  "/:id/payments",
  authorize("owner", "manager", "accountant"),
  recordSupplierPayment,
);

export default router;
