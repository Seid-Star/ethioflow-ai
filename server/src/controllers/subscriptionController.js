import crypto from "crypto";
import asyncHandler from "express-async-handler";
import SubscriptionInvoice from "../models/SubscriptionInvoice.js";
import User from "../models/User.js";
import { PLANS } from "../config/plans.js";
import {
  DAY,
  loadSubscription,
  describeSubscription,
} from "../services/subscriptionService.js";
import {
  chapaConfigured,
  initializeTransaction,
  isValidWebhook,
} from "../services/chapaService.js";
import {
  activatePlan,
  periodDays,
  settleInvoice,
} from "../services/paymentService.js";

const PAID_PLANS = ["basic", "professional", "enterprise"];
const DEMO_METHODS = ["mobile_money", "bank_transfer", "card"];

const newTxRef = () =>
  `EF-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

function pickOrigin(req) {
  const fallback = (process.env.CLIENT_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );
  const origin = req.get("origin");
  if (
    origin &&
    (origin === fallback || /^http:\/\/localhost:\d+$/.test(origin))
  )
    return origin;
  return fallback;
}

export const getSubscription = asyncHandler(async (req, res) => {
  const biz = await loadSubscription(req.auth.business);
  if (!biz) {
    res.status(404);
    throw new Error("Business not found");
  }
  res.json({
    ...(await describeSubscription(biz)),
    paymentsLive: chapaConfigured(),
  });
});

export const getInvoices = asyncHandler(async (req, res) => {
  await SubscriptionInvoice.updateMany(
    {
      business: req.auth.business,
      status: "pending",
      createdAt: { $lt: new Date(Date.now() - 2 * DAY) },
    },
    { $set: { status: "expired" } },
  );
  const invoices = await SubscriptionInvoice.find({
    business: req.auth.business,
  })
    .sort("-createdAt")
    .limit(50);
  res.json(invoices);
});

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

  const amount =
    billingCycle === "yearly" ? PLANS[plan].yearly : PLANS[plan].monthly;
  const txRef = newTxRef();

  if (!chapaConfigured()) {
    if (!DEMO_METHODS.includes(paymentMethod)) {
      res.status(400);
      throw new Error("Choose a payment method");
    }

    const periodStart = new Date();
    const periodEnd = new Date(
      periodStart.getTime() + periodDays(billingCycle) * DAY,
    );
    await activatePlan(req.auth.business, { plan, billingCycle, periodEnd });

    const invoice = await SubscriptionInvoice.create({
      business: req.auth.business,
      plan,
      billingCycle,
      amount,
      status: "paid",
      mode: "demo",
      providerMode: "demo",
      paymentMethod,
      reference: txRef,
      txRef,
      paidAt: periodStart,
      periodStart,
      periodEnd,
      createdBy: req.auth.id,
    });

    const biz = await loadSubscription(req.auth.business);
    return res.status(201).json({
      mode: "demo",
      invoice,
      subscription: await describeSubscription(biz),
    });
  }
  const user = await User.findById(req.auth.id);

  const email =
    typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";

  console.log("Chapa email diagnostics:", {
    userFound: Boolean(user),
    emailPresent: Boolean(email),
    emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    emailLength: email.length,
    emailWithinLimit: email.length <= 50,
  });

  const [firstName, ...rest] = (user?.name || "").trim().split(/\s+/);
  const returnUrl = `${pickOrigin(req)}/dashboard/subscription/return?tx_ref=${encodeURIComponent(txRef)}`;
  const callbackUrl = process.env.PUBLIC_API_URL
    ? `${process.env.PUBLIC_API_URL.replace(/\/$/, "")}/api/subscription/webhook`
    : undefined;

  const invoice = await SubscriptionInvoice.create({
    business: req.auth.business,
    plan,
    billingCycle,
    amount,
    status: "pending",
    mode: "live",
    reference: txRef,
    txRef,
    createdBy: req.auth.id,
  });

  try {
    const checkoutUrl = await initializeTransaction({
      amount,
      txRef,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      returnUrl,
      callbackUrl,
      title: "EthioFlow AI",
      description: `${PLANS[plan].name} plan ${billingCycle}`,
    });

    invoice.checkoutUrl = checkoutUrl;
    await invoice.save();
    res.status(201).json({ mode: "live", checkoutUrl, invoice });
  } catch (err) {
    console.error("Chapa initialize failed:", err.message);
    invoice.status = "failed";
    invoice.failureReason = err.message;
    await invoice.save();
    res.status(502);
    throw new Error(`Could not start the payment: ${err.message}`);
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const txRef = String(req.body?.txRef || "").trim();
  if (!txRef) {
    res.status(400);
    throw new Error("A payment reference is required");
  }

  const invoice = await SubscriptionInvoice.findOne({
    business: req.auth.business,
    txRef,
  });
  if (!invoice) {
    res.status(404);
    throw new Error("We could not find that payment");
  }

  let settled = invoice;
  if (invoice.mode === "live") {
    try {
      settled = await settleInvoice(invoice);
    } catch (err) {
      console.error("Payment verification failed:", err.message);
      res.status(502);
      throw new Error(
        "Could not reach the payment provider. Please try again in a moment.",
      );
    }
  }

  const biz = await loadSubscription(req.auth.business);
  res.json({ invoice: settled, subscription: await describeSubscription(biz) });
});

export const chapaWebhook = asyncHandler(async (req, res) => {
  if (!isValidWebhook(req)) {
    console.warn("⚠ Rejected a Chapa webhook with a bad signature");
    return res.status(401).json({ message: "Invalid signature" });
  }

  const txRef = req.body?.tx_ref || req.body?.trx_ref || req.body?.data?.tx_ref;
  const invoice = txRef
    ? await SubscriptionInvoice.findOne({ txRef: String(txRef) })
    : null;
  if (invoice && invoice.mode === "live") {
    try {
      await settleInvoice(invoice);
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res
        .status(502)
        .json({ message: "Verification failed, please retry" }); // lets Chapa retry later
    }
  }

  res.json({ received: true });
});

export const cancel = asyncHandler(async (req, res) => {
  const biz = await loadSubscription(req.auth.business);

  if (biz.subscriptionStatus === "trialing") {
    biz.subscriptionStatus = "expired";
    biz.trialEndsAt = new Date();
  } else if (biz.subscriptionStatus === "active") {
    biz.subscriptionStatus = "canceled";
  } else {
    res.status(400);
    throw new Error("There is no active subscription to cancel");
  }

  await biz.save();
  res.json({ subscription: await describeSubscription(biz) });
});
