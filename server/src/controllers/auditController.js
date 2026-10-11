import asyncHandler from "express-async-handler";
import AuditLog from "../models/AuditLog.js";
import { AUDIT_CATEGORIES } from "../config/auditRules.js";

// GET /api/audit-logs?page=&limit=&category=&from=&to=
export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const { category, from, to } = req.query;

  const filter = { business: req.auth.business };

  if (category && AUDIT_CATEGORIES.includes(category)) {
    filter.action = { $regex: `^${category}\\.` };
  }

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;
  if ((fromDate && !isNaN(fromDate)) || (toDate && !isNaN(toDate))) {
    filter.createdAt = {};
    if (fromDate && !isNaN(fromDate)) filter.createdAt.$gte = fromDate;
    if (toDate && !isNaN(toDate)) filter.createdAt.$lte = toDate;
  }

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("user", "name")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});
