import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "./mailService.js";

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export function clientOrigin(req) {
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

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

function buildMessage({ name, link }) {
  const subject = "Verify your EthioFlow AI email";

  const text = [
    `Hello ${name},`,
    "",
    "Thanks for creating your EthioFlow AI account. Please confirm your email address by opening this link:",
    "",
    link,
    "",
    "The link works for 24 hours. If you did not create this account, you can ignore this email.",
  ].join("\n");

  const html = `<div style="background:#faf8f3;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0b1a15">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2ede8">
    <div style="background:#0a2e24;padding:22px 28px">
      <span style="font-size:20px;font-weight:bold;color:#ffffff">EthioFlow</span><span style="font-size:20px;font-weight:bold;color:#f5b83d"> AI</span>
    </div>
    <div style="height:4px;background:#f5b83d"></div>
    <div style="padding:28px">
      <p style="font-size:16px;margin:0 0 12px">Hello ${escapeHtml(name)},</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 24px;color:#3d4a45">Thanks for creating your EthioFlow AI account. Please confirm that this is your email address.</p>
      <p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#f5b83d;color:#06231c;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:999px">Verify my email</a></p>
      <p style="font-size:12px;line-height:1.6;color:#6b7a74;margin:0 0 6px">Or copy this link into your browser:</p>
      <p style="font-size:12px;word-break:break-all;margin:0 0 24px"><a href="${link}" style="color:#135241">${link}</a></p>
      <p style="font-size:12px;line-height:1.6;color:#6b7a74;margin:0">This link works for 24 hours. If you did not create this account, you can ignore this email.</p>
    </div>
  </div>
</div>`;

  return { subject, text, html };
}

export async function issueVerification(user, req) {
  const token = crypto.randomBytes(32).toString("hex");

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerifyTokenHash: hashToken(token),
        emailVerifyExpires: new Date(Date.now() + VERIFY_TTL_MS),
        emailVerifySentAt: new Date(),
      },
    },
  );

  const link = `${clientOrigin(req)}/verify-email?token=${token}`;
  return sendMail({
    to: user.email,
    ...buildMessage({ name: user.name, link }),
  });
}
