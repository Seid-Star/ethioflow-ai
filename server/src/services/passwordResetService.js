import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "./mailService.js";
import { clientOrigin, hashToken } from "./emailVerificationService.js";

export const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

export async function sendPasswordReset(user, req) {
  const token = crypto.randomBytes(32).toString("hex");

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetTokenHash: hashToken(token),
        passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
        passwordResetSentAt: new Date(),
      },
    },
  );

  const link = `${clientOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = "Reset your EthioFlow AI password";

  const text = [
    `Hello ${user.name},`,
    "",
    "We received a request to reset your EthioFlow AI password.",
    "Open the link below to choose a new password:",
    "",
    link,
    "",
    "This link expires in 15 minutes and can only be used once.",
    "If you did not request a password reset, you can ignore this email.",
  ].join("\n");

  const safeName = String(user.name || "there").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

  const html = `
    <div style="background:#faf8f3;padding:32px 16px;font-family:Arial,sans-serif;color:#0b1a15">
      <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e2ede8;border-radius:16px;overflow:hidden">
        <div style="background:#0a2e24;padding:22px 28px;font-size:20px;font-weight:bold">
          <span style="color:#fff">EthioFlow</span>
          <span style="color:#f5b83d"> AI</span>
        </div>
        <div style="height:4px;background:#f5b83d"></div>
        <div style="padding:28px">
          <p>Hello ${safeName},</p>
          <p style="font-size:14px;line-height:1.6;color:#3d4a45">
            We received a request to reset your password. Click below to choose a new one.
          </p>
          <p style="margin:24px 0">
            <a href="${link}" style="background:#f5b83d;color:#06231c;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block">
              Reset my password
            </a>
          </p>
          <p style="font-size:12px;line-height:1.6;color:#6b7a74">
            This link expires in 15 minutes and can only be used once. If you did not request this, ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendMail({ to: user.email, subject, text, html });
}
