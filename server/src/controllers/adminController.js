import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import AuditLog from "../models/AuditLog.js";
import ContactMessage, { TOPIC_LABELS } from "../models/ContactMessage.js";
import SubscriptionInvoice from "../models/SubscriptionInvoice.js";
import { sendMail } from "../services/mailService.js";
import { PLANS } from "../config/plans.js";
import { DAY } from "../services/subscriptionService.js";

const PAGE_SIZE = 20;
const GRANTABLE_PLANS = ["free", "basic", "professional", "enterprise"];
const MESSAGE_STATUSES = ["new", "read", "replied", "archived"];

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const teamInbox = () =>
  (process.env.CONTACT_INBOX || process.env.SMTP_USER || "")
    .split(",")[0]
    .trim() || undefined;

function pageOf(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  return { page, skip: (page - 1) * PAGE_SIZE };
}

function requireId(req, res, label) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error(`${label} not found`);
  }
}

function planState(b) {
  const now = Date.now();
  const paid =
    ["active", "canceled"].includes(b.subscriptionStatus) &&
    b.currentPeriodEnd &&
    new Date(b.currentPeriodEnd).getTime() > now;
  if (paid) return { key: b.subscriptionPlan, status: b.subscriptionStatus };
  if (
    b.subscriptionStatus === "trialing" &&
    b.trialEndsAt &&
    new Date(b.trialEndsAt).getTime() > now
  ) {
    return { key: "trial", status: "trialing" };
  }
  return { key: "free", status: b.subscriptionStatus || "none" };
}

async function adminAudit(req, businessId, action, summary) {
  try {
    await AuditLog.create({
      business: businessId,
      user: req.auth.id,
      role: "platform_admin",
      action,
      entityType: "admin",
      summary,
      ip: req.ip,
    });
  } catch (err) {
    console.error("Admin audit write failed:", err.message);
  }
}

// GET /api/admin/summary
export const getSummary = asyncHandler(async (req, res) => {
  const now = Date.now();

  const [businesses, userCount, newMessages, invoiceGroups, activity] =
    await Promise.all([
      Business.find()
        .select(
          "createdAt subscriptionPlan subscriptionStatus trialEndsAt currentPeriodEnd",
        )
        .lean(),
      User.countDocuments(),
      ContactMessage.countDocuments({ status: "new" }),
      SubscriptionInvoice.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: { mode: "$mode", providerMode: "$providerMode" },
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      AuditLog.find()
        .sort("-createdAt")
        .limit(15)
        .populate("user", "name")
        .populate("business", "name")
        .lean(),
    ]);

  const plans = { free: 0, trial: 0, basic: 0, professional: 0, enterprise: 0 };
  for (const b of businesses) {
    const { key } = planState(b);
    plans[key] = (plans[key] || 0) + 1;
  }

  const revenue = {
    live: { amount: 0, count: 0 },
    test: { amount: 0, count: 0 },
    demo: { amount: 0, count: 0 },
  };
  for (const group of invoiceGroups) {
    const key =
      group._id.mode === "demo" || group._id.providerMode === "demo"
        ? "demo"
        : group._id.providerMode === "live"
          ? "live"
          : "test";
    revenue[key].amount += group.amount;
    revenue[key].count += group.count;
  }

  res.json({
    businesses: businesses.length,
    users: userCount,
    newBusinesses7d: businesses.filter(
      (b) => now - new Date(b.createdAt).getTime() < 7 * DAY,
    ).length,
    newBusinesses30d: businesses.filter(
      (b) => now - new Date(b.createdAt).getTime() < 30 * DAY,
    ).length,
    plans,
    revenue,
    messages: { new: newMessages },
    health: {
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
    },
    recentActivity: activity.map((a) => ({
      id: a._id,
      action: a.action,
      summary: a.summary,
      user: a.user?.name || "System",
      business: a.business?.name || "-",
      createdAt: a.createdAt,
    })),
  });
});

// GET /api/admin/unread
export const getUnread = asyncHandler(async (req, res) => {
  res.json({ count: await ContactMessage.countDocuments({ status: "new" }) });
});

// GET /api/admin/businesses?q=&page=
export const getBusinesses = asyncHandler(async (req, res) => {
  const { page, skip } = pageOf(req);
  const q = String(req.query.q || "").trim();
  const filter = q ? { name: { $regex: escapeRegex(q), $options: "i" } } : {};

  const [businesses, total] = await Promise.all([
    Business.find(filter).sort("-createdAt").skip(skip).limit(PAGE_SIZE).lean(),
    Business.countDocuments(filter),
  ]);

  const ids = businesses.map((b) => b._id);
  const [users, products, sales] = await Promise.all([
    User.find({ business: { $in: ids } })
      .select(
        "name email phone role status emailVerified isPlatformAdmin business",
      )
      .lean(),
    Product.aggregate([
      { $match: { business: { $in: ids }, isActive: true } },
      { $group: { _id: "$business", n: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { business: { $in: ids } } },
      { $group: { _id: "$business", n: { $sum: 1 } } },
    ]),
  ]);

  const productCounts = new Map(products.map((p) => [String(p._id), p.n]));
  const saleCounts = new Map(sales.map((s) => [String(s._id), s.n]));

  const items = businesses.map((b) => {
    const members = users.filter((u) => String(u.business) === String(b._id));
    const owner = members.find((u) => u.role === "owner") || members[0] || null;
    const state = planState(b);

    return {
      id: b._id,
      name: b.name,
      type: b.type,
      createdAt: b.createdAt,
      suspended: Boolean(b.suspended),
      suspendedReason: b.suspendedReason || "",
      plan: state.key,
      subscriptionStatus: state.status,
      billingCycle: b.billingCycle,
      periodEnd: b.currentPeriodEnd || null,
      trialEndsAt: b.trialEndsAt || null,
      owner: owner
        ? {
            id: owner._id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
          }
        : null,
      users: members.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        emailVerified: u.emailVerified,
        isPlatformAdmin: Boolean(u.isPlatformAdmin),
        isYou: String(u._id) === String(req.auth.id),
      })),
      productCount: productCounts.get(String(b._id)) || 0,
      saleCount: saleCounts.get(String(b._id)) || 0,
      isOwnBusiness: String(b._id) === String(req.auth.business),
    };
  });

  res.json({
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
});

// PATCH /api/admin/businesses/:id/suspend
export const setBusinessSuspended = asyncHandler(async (req, res) => {
  requireId(req, res, "Business");

  const suspended = req.body?.suspended === true;
  const reason = String(req.body?.reason || "")
    .trim()
    .slice(0, 200);

  if (suspended && String(req.params.id) === String(req.auth.business)) {
    res.status(400);
    throw new Error("You cannot suspend your own business");
  }

  const update = suspended
    ? {
        $set: {
          suspended: true,
          suspendedReason: reason,
          suspendedAt: new Date(),
        },
      }
    : {
        $set: { suspended: false, suspendedReason: "" },
        $unset: { suspendedAt: 1 },
      };

  const business = await Business.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).select("name suspended");
  if (!business) {
    res.status(404);
    throw new Error("Business not found");
  }

  if (suspended)
    await User.updateMany(
      { business: business._id },
      { $unset: { refreshToken: 1 } },
    );

  await adminAudit(
    req,
    business._id,
    suspended ? "admin.suspend" : "admin.reactivate",
    suspended
      ? `Business suspended by platform admin${reason ? `: ${reason}` : ""}`
      : "Business reactivated by platform admin",
  );

  res.json({ id: business._id, suspended: business.suspended });
});

// POST /api/admin/businesses/:id/grant-plan
export const grantPlan = asyncHandler(async (req, res) => {
  requireId(req, res, "Business");

  const plan = req.body?.plan;
  const days = Math.min(365, Math.max(1, parseInt(req.body?.days, 10) || 30));

  if (!GRANTABLE_PLANS.includes(plan)) {
    res.status(400);
    throw new Error("Choose a valid plan");
  }

  const update =
    plan === "free"
      ? { $set: { subscriptionPlan: "free", subscriptionStatus: "expired" } }
      : {
          $set: {
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            currentPeriodEnd: new Date(Date.now() + days * DAY),
          },
        };

  const business = await Business.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).select("name");
  if (!business) {
    res.status(404);
    throw new Error("Business not found");
  }

  await adminAudit(
    req,
    business._id,
    "admin.grant_plan",
    plan === "free"
      ? "Plan reset to Free by platform admin"
      : `Platform admin set the plan to ${PLANS[plan].name} for ${days} day${days === 1 ? "" : "s"}`,
  );

  res.json({ id: business._id, plan, days });
});

// PATCH /api/admin/users/:id/status
export const setUserStatus = asyncHandler(async (req, res) => {
  requireId(req, res, "User");

  const status = req.body?.status;
  if (!["active", "inactive"].includes(status)) {
    res.status(400);
    throw new Error("Status must be active or inactive");
  }
  if (String(req.params.id) === String(req.auth.id)) {
    res.status(400);
    throw new Error("You cannot change your own account");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true },
  ).select("name business status");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (status === "inactive")
    await User.updateOne({ _id: user._id }, { $unset: { refreshToken: 1 } });

  await adminAudit(
    req,
    user.business,
    status === "inactive" ? "admin.deactivate_user" : "admin.activate_user",
    `${user.name}'s account was ${status === "inactive" ? "deactivated" : "reactivated"} by platform admin`,
  );

  res.json({ id: user._id, status: user.status });
});

function formatMessage(doc) {
  return {
    id: doc._id,
    reference: `MSG-${doc._id.toString().slice(-6).toUpperCase()}`,
    name: doc.name,
    email: doc.email || null,
    phone: doc.phone || null,
    topic: doc.topic,
    topicLabel: TOPIC_LABELS[doc.topic] || TOPIC_LABELS.general,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt,
    acknowledgedAt: doc.acknowledgedAt || null,
    replies: (doc.replies || []).map((r) => ({
      body: r.body,
      sentTo: r.sentTo,
      sentAt: r.sentAt,
      by: r.by?.name || "Admin",
    })),
  };
}

// GET /api/admin/messages?status=open|new|read|replied|archived|all&page=
export const getMessages = asyncHandler(async (req, res) => {
  const { page, skip } = pageOf(req);
  const view = String(req.query.status || "open");
  const filter =
    view === "open"
      ? { status: { $in: ["new", "read"] } }
      : MESSAGE_STATUSES.includes(view)
        ? { status: view }
        : {};

  const [items, total, grouped] = await Promise.all([
    ContactMessage.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate("replies.by", "name"),
    ContactMessage.countDocuments(filter),
    ContactMessage.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  const counts = { new: 0, read: 0, replied: 0, archived: 0 };
  for (const g of grouped) if (g._id in counts) counts[g._id] = g.n;

  res.json({
    items: items.map(formatMessage),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    counts,
  });
});

// PATCH /api/admin/messages/:id
export const updateMessage = asyncHandler(async (req, res) => {
  requireId(req, res, "Message");

  const status = req.body?.status;
  if (!MESSAGE_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const update = { $set: { status } };
  if (status === "replied") update.$set.repliedAt = new Date();

  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true },
  ).populate("replies.by", "name");
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  res.json(formatMessage(message));
});

// POST /api/admin/messages/:id/reply
export const replyToMessage = asyncHandler(async (req, res) => {
  requireId(req, res, "Message");

  const body = String(req.body?.body || "")
    .replace(/\0/g, "")
    .trim();
  if (body.length < 2 || body.length > 4000) {
    res.status(400);
    throw new Error("Write a reply between 2 and 4000 characters");
  }

  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  if (!message.email) {
    res.status(400);
    throw new Error(
      'This visitor left only a phone number. Call or message them, then press "Mark as replied".',
    );
  }

  const reference = `MSG-${message._id.toString().slice(-6).toUpperCase()}`;
  const topic = TOPIC_LABELS[message.topic] || TOPIC_LABELS.general;

  const text = [
    body,
    "",
    "--",
    "EthioFlow AI team",
    "",
    `In reply to your message (${reference}):`,
    message.message,
  ]
    .join("\n")
    .trim();

  const html = `<div style="background:#faf8f3;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#0b1a15">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2ede8">
    <div style="background:#0a2e24;padding:20px 26px">
      <span style="font-size:18px;font-weight:bold;color:#ffffff">EthioFlow</span><span style="font-size:18px;font-weight:bold;color:#f5b83d"> AI</span>
    </div>
    <div style="height:4px;background:#f5b83d"></div>
    <div style="padding:26px">
      <div style="font-size:14px;line-height:1.7;white-space:pre-wrap">${escapeHtml(body)}</div>
      <p style="font-size:13px;color:#3d4a45;margin:22px 0 0">EthioFlow AI team</p>
      <div style="margin-top:22px;padding-top:16px;border-top:1px solid #e2ede8">
        <p style="font-size:11px;color:#6b7a74;margin:0 0 6px">In reply to your message (${escapeHtml(reference)}):</p>
        <div style="font-size:12px;line-height:1.6;color:#6b7a74;white-space:pre-wrap">${escapeHtml(message.message)}</div>
      </div>
    </div>
  </div>
</div>`;

  let delivered = false;
  try {
    const result = await sendMail({
      to: message.email,
      replyTo: teamInbox(),
      subject: `Re: ${topic} (${reference})`,
      text,
      html,
    });
    delivered = result.delivered;
  } catch (err) {
    console.error("Reply email failed:", err.message);
    res.status(502);
    throw new Error(`The email could not be sent: ${err.message}`);
  }

  if (!delivered) {
    res.status(503);
    throw new Error(
      "Email is not set up on this server, so the reply was not sent.",
    );
  }

  message.replies.push({
    body,
    sentTo: message.email,
    by: req.auth.id,
    sentAt: new Date(),
  });
  message.status = "replied";
  message.repliedAt = new Date();
  await message.save();
  await message.populate("replies.by", "name");

  res.json(formatMessage(message));
});
