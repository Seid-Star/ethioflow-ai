import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceProductLimit } from "../middleware/planGate.js";
import { validateProduct } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

router.use(protect);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post(
  "/",
  authorize("owner", "manager"),
  enforceProductLimit,
  validateProduct,
  validate,
  createProduct,
);
router.put(
  "/:id",
  authorize("owner", "manager"),
  validateProduct,
  validate,
  updateProduct,
);
router.delete("/:id", authorize("owner", "manager"), deleteProduct);

export default router;
