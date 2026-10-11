import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { PLANS } from "../config/plans.js";
import {
  loadSubscription,
  effectivePlanOf,
  planAtLeast,
} from "../services/subscriptionService.js";

// Blocks a route unless the business is on `minPlan` or higher (a trial counts as Professional)
export function requirePlan(minPlan, featureLabel) {
  return asyncHandler(async (req, res, next) => {
    const biz = await loadSubscription(req.auth.business);
    if (!biz) return res.status(404).json({ message: "Business not found" });

    if (!planAtLeast(effectivePlanOf(biz), minPlan)) {
      return res.status(402).json({
        message: `${featureLabel} is available on the ${PLANS[minPlan].name} plan. Upgrade to unlock it.`,
        code: "PLAN_REQUIRED",
        requiredPlan: minPlan,
      });
    }
    next();
  });
}

// Stops product creation once the plan's product limit is reached
export const enforceProductLimit = asyncHandler(async (req, res, next) => {
  const biz = await loadSubscription(req.auth.business);
  if (!biz) return res.status(404).json({ message: "Business not found" });

  const plan = effectivePlanOf(biz);
  const limit = PLANS[plan].maxProducts;

  if (limit !== null) {
    const count = await Product.countDocuments({
      business: req.auth.business,
      isActive: true,
    });
    if (count >= limit) {
      return res.status(402).json({
        message: `Your ${PLANS[plan].name} plan allows up to ${limit} products. Upgrade to add more.`,
        code: "PLAN_LIMIT",
      });
    }
  }
  next();
});
