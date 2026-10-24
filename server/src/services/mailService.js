import nodemailer from "nodemailer";

let transporter;

const brevoConfigured = () => Boolean(process.env.BREVO_API_KEY);
const smtpConfigured = () =>
  Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );

export const mailConfigured = () => brevoConfigured() || smtpConfigured();

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 465;
    const pass = /gmail/i.test(host)
      ? process.env.SMTP_PASS.replace(/\s+/g, "")
      : process.env.SMTP_PASS;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

function parseSender(value) {
  const text = String(value || "").trim();
  const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(text);
  if (match)
    return { name: match[1].trim() || "EthioFlow AI", email: match[2].trim() };
  return { name: "EthioFlow AI", email: text };
}

async function sendWithBrevo({ to, subject, text, html, replyTo }) {
  const senderValue = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!senderValue) {
    throw new Error("Email sender is not configured");
  }

  const sender = parseSender(senderValue);

  if (!sender.email || !sender.email.includes("@")) {
    throw new Error("Email sender address is invalid");
  }
  const recipients = String(to)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ||
        `The email service answered with status ${response.status}`,
    );
  }
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  if (brevoConfigured()) {
    await sendWithBrevo({ to, subject, text, html, replyTo });
    return { delivered: true };
  }

  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "production")
      throw new Error("Email is not configured on the server");
    console.log(
      `\n📧 Email is not set up, so nothing was sent. Message for ${to}:\n   ${subject}\n   ${text.replace(/\n/g, "\n   ")}\n`,
    );
    return { delivered: false };
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || `EthioFlow AI <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  return { delivered: true };
}
