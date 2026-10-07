import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = Router();
router.use(protect);

router.get("/", getNotifications);
router.post("/:id/read", markAsRead);
router.post("/read-all", markAllAsRead);

export default router;
