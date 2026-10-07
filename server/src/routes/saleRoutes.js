import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createSale,
  getSales,
  getSale,
} from "../controllers/saleController.js";
import { validateSaleCheckout } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
const router = Router();

router.use(protect);
router.post(
  "/",
  authorize("owner", "manager", "cashier"),
  validateSaleCheckout,
  validate,
  createSale,
);
router.post("/", authorize("owner", "manager", "cashier"), createSale);
router.get("/", getSales);
router.get("/:id", getSale);

export default router;
