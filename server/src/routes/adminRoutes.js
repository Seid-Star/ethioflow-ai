import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { platformAdmin } from "../middleware/platformAdmin.js";
import {
  getSummary,
  getUnread,
  getBusinesses,
  setBusinessSuspended,
  grantPlan,
  setUserStatus,
  getMessages,
  updateMessage,
  replyToMessage,
} from "../controllers/adminController.js";

const router = Router();

router.use(protect, platformAdmin);

router.get("/summary", getSummary);
router.get("/unread", getUnread);
router.get("/businesses", getBusinesses);
router.patch("/businesses/:id/suspend", setBusinessSuspended);
router.post("/businesses/:id/grant-plan", grantPlan);
router.patch("/users/:id/status", setUserStatus);
router.get("/messages", getMessages);
router.patch("/messages/:id", updateMessage);
router.post("/messages/:id/reply", replyToMessage);

export default router;
