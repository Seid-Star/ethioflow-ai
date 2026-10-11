import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getAuditLogs } from "../controllers/auditController.js";

const router = Router();
router.use(protect);

router.get("/", authorize("owner", "manager"), getAuditLogs);

export default router;
