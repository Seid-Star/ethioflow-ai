import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

router.use(protect); // every route below requires login

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", authorize("owner", "manager"), createProduct);
router.put("/:id", authorize("owner", "manager"), updateProduct);
router.delete("/:id", authorize("owner", "manager"), deleteProduct);

export default router;
