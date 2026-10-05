import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMovements,
  stockIn,
  adjustStock,
  getForecast,
} from "../controllers/inventoryController.js";

const router = Router();

router.use(protect);

router.get("/movements", getMovements);
router.post("/stock-in", authorize("owner", "manager"), stockIn);
router.post("/adjust", authorize("owner", "manager", "cashier"), adjustStock);
router.get("/forecast", getForecast);
export default router;
