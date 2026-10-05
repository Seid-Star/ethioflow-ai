import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { syncSales } from "../controllers/syncController.js";

const router = Router();
router.use(protect);

router.post("/sales", syncSales);

export default router;
