import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const platformAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.auth.id).select(
    "isPlatformAdmin status",
  );

  if (!user || user.status !== "active" || user.isPlatformAdmin !== true) {
    res.status(403);
    throw new Error("Platform administrators only");
  }
  next();
});
