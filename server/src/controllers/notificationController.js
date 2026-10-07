import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import { generateNotifications } from "../services/notificationService.js";

// GET /api/notifications — generates anything new, then returns the recent list
export const getNotifications = asyncHandler(async (req, res) => {
  await generateNotifications(req.auth.business);

  const notifications = await Notification.find({ business: req.auth.business })
    .sort("-createdAt")
    .limit(30);

  res.json(notifications);
});

// POST /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    { isRead: true },
    { new: true },
  );
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json(notification);
});

// POST /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { business: req.auth.business, isRead: false },
    { isRead: true },
  );
  res.status(204).send();
});
