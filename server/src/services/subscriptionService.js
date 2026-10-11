import Business from "../models/Business.js";
import Product from "../models/Product.js";
import { PLANS, PLAN_ORDER, TRIAL_DAYS } from "../config/plans.js";

export const DAY = 24 * 60 * 60 * 1000;

// Loads the business and quietly keeps its subscription state honest:
// starts a trial for accounts that never had one, and expires anything that has run out.
export async function loadSubscription(businessId) {
  const biz = await Business.findById(businessId);
  if (!biz) return null;

  const now = new Date();
  let dirty = false;

  if (!biz.subscriptionStatus) {
    biz.subscriptionStatus = "trialing";
    biz.subscriptionPlan = "free";
    biz.trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * DAY);
    dirty = true;
  }
  if (biz.subscriptionStatus === "trialing" && biz.trialEndsAt <= now) {
    biz.subscriptionStatus = "expired";
    dirty = true;
  }
  if (
    (biz.subscriptionStatus === "active" ||
      biz.subscriptionStatus === "canceled") &&
    biz.currentPeriodEnd &&
    biz.currentPeriodEnd <= now
  ) {
    biz.subscriptionStatus = "expired";
    dirty = true;
  }

  if (dirty) await biz.save();
  return biz;
}

// The plan whose features the business can use right now
export function effectivePlanOf(biz) {
  if (biz.subscriptionStatus === "trialing") return "professional";
  if (
    biz.subscriptionStatus === "active" ||
    biz.subscriptionStatus === "canceled"
  )
    return biz.subscriptionPlan;
  return "free";
}

export function planAtLeast(plan, min) {
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(min);
}

export async function describeSubscription(biz) {
  const plan = effectivePlanOf(biz);
  const products = await Product.countDocuments({
    business: biz._id,
    isActive: true,
  });

  return {
    plan,
    paidPlan: biz.subscriptionPlan,
    status: biz.subscriptionStatus,
    billingCycle: biz.billingCycle,
    trialEndsAt: biz.trialEndsAt || null,
    trialDaysLeft:
      biz.subscriptionStatus === "trialing"
        ? Math.max(0, Math.ceil((biz.trialEndsAt - Date.now()) / DAY))
        : 0,
    currentPeriodEnd: biz.currentPeriodEnd || null,
    limits: { maxProducts: PLANS[plan].maxProducts },
    usage: { products },
  };
}
