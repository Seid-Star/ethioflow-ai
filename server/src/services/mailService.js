import nodemailer from "nodemailer";

let transporter;

export const mailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );

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

export async function sendMail({ to, subject, text, html, replyTo }) {
  if (!mailConfigured()) {
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
