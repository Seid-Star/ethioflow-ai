import asyncHandler from "express-async-handler";
import SubscriptionInvoice from "../models/SubscriptionInvoice.js";
import { PLANS } from "../config/plans.js";
import {
  DAY,
  loadSubscription,
  describeSubscription,
} from "../services/subscriptionService.js";

const PAID_PLANS = ["basic", "professional", "enterprise"];
const METHODS = ["mobile_money", "bank_transfer", "card"];

// GET /api/subscription
export const getSubscription = asyncHandler(async (req, res) => {
  const biz = await loadSubscription(req.auth.business);
  if (!biz) {
    res.status(404);
    throw new Error("Business not found");
  }
  res.json(await describeSubscription(biz));
});

// GET /api/subscription/invoices
export const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await SubscriptionInvoice.find({
    business: req.auth.business,
  })
    .sort("-createdAt")
    .limit(50);
  res.json(invoices);
});

// POST /api/subscription/checkout (DEMO MODE: records an invoice, charges nothing)
export const checkout = asyncHandler(async (req, res) => {
  const { plan, billingCycle = "monthly", paymentMethod } = req.body;

  if (!PAID_PLANS.includes(plan)) {
    res.status(400);
    throw new Error("Choose a paid plan");
  }
  if (!["monthly", "yearly"].includes(billingCycle)) {
    res.status(400);
    throw new Error("Billing cycle must be monthly or yearly");
  }
  if (!METHODS.includes(paymentMethod)) {
    res.status(400);
    throw new Error("Choose a payment method");
  }

  // The price always comes from the server, never from the browser
  const amount =
    billingCycle === "yearly" ? PLANS[plan].yearly : PLANS[plan].monthly;
  const periodStart = new Date();
  const periodEnd = new Date(
    periodStart.getTime() + (billingCycle === "yearly" ? 365 : 30) * DAY,
  );

  const biz = await loadSubscription(req.auth.business);
  biz.subscriptionPlan = plan;
  biz.subscriptionStatus = "active";
  biz.billingCycle = billingCycle;
  biz.currentPeriodEnd = periodEnd;
  await biz.save();

  const invoice = await SubscriptionInvoice.create({
    business: req.auth.business,
    plan,
    billingCycle,
    amount,
    paymentMethod,
    reference: `EF-${Date.now().toString(36).toUpperCase()}`,
    periodStart,
    periodEnd,
    createdBy: req.auth.id,
  });

  res
    .status(201)
    .json({ subscription: await describeSubscription(biz), invoice });
});

// POST /api/subscription/cancel
export const cancel = asyncHandler(async (req, res) => {
  const biz = await loadSubscription(req.auth.business);

  if (biz.subscriptionStatus === "trialing") {
    biz.subscriptionStatus = "expired"; // ending a trial early drops to Free straight away
    biz.trialEndsAt = new Date();
  } else if (biz.subscriptionStatus === "active") {
    biz.subscriptionStatus = "canceled"; // a paid plan keeps working until the period ends
  } else {
    res.status(400);
    throw new Error("There is no active subscription to cancel");
  }

  await biz.save();
  res.json({ subscription: await describeSubscription(biz) });
});
