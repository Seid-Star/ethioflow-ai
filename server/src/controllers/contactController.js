import crypto from "crypto";
import asyncHandler from "express-async-handler";
import ContactMessage, {
  TOPICS,
  TOPIC_LABELS,
} from "../models/ContactMessage.js";
import { normalizePhone } from "../utils/phone.js";
import { sendMail } from "../services/mailService.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_CONFIRMATION_CAP = 150;

const clean = (value) =>
  String(value ?? "")
    .replace(/\0/g, "")
    .trim();
const oneLine = (value) => clean(value).replace(/[\r\n\t]+/g, " ");
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

function buildNotification(contact, reference) {
  const topic = TOPIC_LABELS[contact.topic] || TOPIC_LABELS.general;
  const inboxUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/dashboard/admin`
    : "";

  const text = [
    "New message from the EthioFlow AI website",
    "",
    `Reference: ${reference}`,
    `Topic: ${topic}`,
    `Name: ${contact.name}`,
    `Email: ${contact.email || "-"}`,
    `Phone: ${contact.phone || "-"}`,
    "",
    "Message:",
    contact.message,
    ...(inboxUrl ? ["", `Read and reply in the app: ${inboxUrl}`] : []),
  ].join("\n");

  const row = (label, value) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#6b7a74;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;font-size:14px;color:#0b1a15">${value}</td></tr>`;

  const html = `<div style="background:#faf8f3;padding:28px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2ede8">
    <div style="background:#0a2e24;padding:18px 24px;color:#ffffff;font-size:16px;font-weight:bold">New website message</div>
    <div style="height:4px;background:#f5b83d"></div>
    <div style="padding:24px">
      <table style="border-collapse:collapse;margin-bottom:18px">
        ${row("Reference", escapeHtml(reference))}
        ${row("Topic", escapeHtml(topic))}
        ${row("Name", escapeHtml(contact.name))}
        ${row("Email", contact.email ? escapeHtml(contact.email) : "-")}
        ${row("Phone", contact.phone ? escapeHtml(contact.phone) : "-")}
      </table>
      <div style="background:#f0f6f3;border-radius:12px;padding:16px;font-size:14px;line-height:1.6;color:#0b1a15;white-space:pre-wrap">${escapeHtml(contact.message)}</div>
      <p style="font-size:12px;color:#6b7a74;margin:16px 0 0">${contact.email ? "Press Reply to answer this person directly." : "This person left a phone number only, so please call or message them."}</p>
    </div>
  </div>
</div>`;

  return {
    subject: `[EthioFlow] ${topic} from ${oneLine(contact.name)}`,
    text,
    html,
  };
}

function buildConfirmation(reference) {
  const text = [
    "Hello,",
    "",
    "Thank you for contacting EthioFlow AI. We have received your message and will get back to you soon.",
    "",
    `Reference: ${reference}`,
    "",
    "This is an automatic confirmation. If you did not send a message to us, you can ignore this email.",
    "",
    "EthioFlow AI",
  ].join("\n");

  const html = `<div style="background:#faf8f3;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0b1a15">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2ede8">
    <div style="background:#0a2e24;padding:22px 28px">
      <span style="font-size:20px;font-weight:bold;color:#ffffff">EthioFlow</span><span style="font-size:20px;font-weight:bold;color:#f5b83d"> AI</span>
    </div>
    <div style="height:4px;background:#f5b83d"></div>
    <div style="padding:28px">
      <p style="font-size:16px;margin:0 0 12px">Hello,</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#3d4a45">Thank you for contacting EthioFlow AI. We have received your message and will get back to you soon.</p>
      <p style="font-size:13px;margin:0 0 20px;color:#3d4a45">Reference <b style="font-family:monospace">${escapeHtml(reference)}</b></p>
      <p style="font-size:12px;line-height:1.6;color:#6b7a74;margin:0">This is an automatic confirmation. If you did not send a message to us, you can ignore this email.</p>
    </div>
  </div>
</div>`;

  return { subject: `We received your message (${reference})`, text, html };
}

async function notifyTeam(contact, reference) {
  const to =
    process.env.CONTACT_INBOX ||
    process.env.SMTP_USER ||
    "the team (set CONTACT_INBOX in .env)";
  const result = await sendMail({
    to,
    replyTo: contact.email || undefined,
    ...buildNotification(contact, reference),
  });
  return result.delivered;
}

async function confirmToVisitor(contact, reference) {
  if (!contact.email) return false;

  const since = new Date(Date.now() - DAY_MS);
  const [alreadyToday, sentToday] = await Promise.all([
    ContactMessage.exists({
      email: contact.email,
      acknowledgedAt: { $gte: since },
    }),
    ContactMessage.countDocuments({ acknowledgedAt: { $gte: since } }),
  ]);
  if (alreadyToday || sentToday >= DAILY_CONFIRMATION_CAP) return false;

  const result = await sendMail({
    to: contact.email,
    replyTo: teamInbox(),
    ...buildConfirmation(reference),
  });
  if (result.delivered)
    await ContactMessage.updateOne(
      { _id: contact._id },
      { $set: { acknowledgedAt: new Date() } },
    );
  return result.delivered;
}

// POST /api/contact (public)
export const submitContact = asyncHandler(async (req, res) => {
  if (clean(req.body?.website)) {
    return res.status(201).json({
      received: true,
      reference: `MSG-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    });
  }

  const name = oneLine(req.body?.name);
  const email = clean(req.body?.email).toLowerCase();
  const rawPhone = clean(req.body?.phone);
  const message = clean(req.body?.message);
  const topic = TOPICS.includes(req.body?.topic) ? req.body.topic : "general";

  if (name.length < 2 || name.length > 80) {
    res.status(400);
    throw new Error("Please tell us your name");
  }

  let phone;
  if (rawPhone) {
    phone = normalizePhone(rawPhone);
    if (!phone) {
      res.status(400);
      throw new Error(
        "Enter a valid Ethiopian mobile number, for example 0911 234 567",
      );
    }
  }

  if (email && (!EMAIL.test(email) || email.length > 120)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  if (!email && !phone) {
    res.status(400);
    throw new Error(
      "Give us an email address or a phone number so we can reply",
    );
  }

  if (message.length < 10) {
    res.status(400);
    throw new Error(
      "Please write a little more so we can help (at least 10 characters)",
    );
  }
  if (message.length > 2000) {
    res.status(400);
    throw new Error(
      "Your message is too long. Please keep it under 2000 characters",
    );
  }

  const saved = await ContactMessage.create({
    name,
    email: email || undefined,
    phone,
    topic,
    message,
    ip: req.ip,
    userAgent: clean(req.get("user-agent")).slice(0, 300),
  });

  const reference = `MSG-${saved._id.toString().slice(-6).toUpperCase()}`;

  try {
    if (await notifyTeam(saved, reference)) {
      await ContactMessage.updateOne(
        { _id: saved._id },
        { $set: { notified: true } },
      );
    }
  } catch (err) {
    console.error("Contact notification failed:", err.message);
  }

  let confirmationSent = false;
  try {
    confirmationSent = await confirmToVisitor(saved, reference);
  } catch (err) {
    console.error("Visitor confirmation failed:", err.message);
  }

  res.status(201).json({ received: true, reference, confirmationSent });
});
