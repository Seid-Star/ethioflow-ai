import crypto from "crypto";

const BASE_URL = "https://api.chapa.co/v1";

export const chapaConfigured = () => Boolean(process.env.CHAPA_SECRET_KEY);

async function chapaRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(20000),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {}
  return { ok: res.ok, httpStatus: res.status, body };
}

function errorText(body) {
  const message = body?.message;
  if (typeof message === "string") return message;
  if (message && typeof message === "object")
    return Object.values(message).flat().join(" ");
  return "The payment provider returned an error";
}

export async function initializeTransaction({
  amount,
  txRef,
  email,
  firstName,
  lastName,
  returnUrl,
  callbackUrl,
  title,
  description,
}) {
  const base = {
    amount: String(amount),
    currency: "ETB",
    tx_ref: txRef,
    return_url: returnUrl,
    customization: { title, description },
  };
  if (callbackUrl) base.callback_url = callbackUrl;

  const names = {
    ...(firstName && { first_name: firstName }),
    ...(lastName && { last_name: lastName }),
  };

  // Chapa checks customer details strictly (it rejects emails at made-up domains, for example).
  // They are all optional, so if they are the only problem we continue with fewer of them.
  const attempts = [
    { ...base, ...(email && { email }), ...names },
    { ...base, ...names },
    base,
  ];

  let lastBody = null;
  for (const [index, payload] of attempts.entries()) {
    const { ok, body } = await chapaRequest("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const checkoutUrl = body?.data?.checkout_url;
    if (ok && checkoutUrl) return checkoutUrl;

    lastBody = body;

    // Field-level complaints come back as an object, e.g. { email: [...] }.
    // Anything else (a bad key, a blocked account) will not be fixed by dropping details.
    const isFieldProblem = body?.message && typeof body.message === "object";
    if (!isFieldProblem) break;

    if (index < attempts.length - 1) {
      console.warn(
        `⚠ Chapa rejected some customer details (${Object.keys(body.message).join(", ")}), retrying without them`,
      );
    }
  }

  throw new Error(errorText(lastBody));
}

function normalizeStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "success") return "success";
  if (
    [
      "failed",
      "failure",
      "cancelled",
      "canceled",
      "error",
      "reversed",
      "refunded",
    ].includes(s)
  )
    return "failed";
  return "pending";
}

export async function verifyTransaction(txRef) {
  const { ok, httpStatus, body } = await chapaRequest(
    `/transaction/verify/${encodeURIComponent(txRef)}`,
  );

  if (!ok) {
    if (httpStatus === 404 || /not found|invalid/i.test(errorText(body)))
      return { found: false, status: "pending" };
    throw new Error(errorText(body));
  }

  const d = body?.data || {};
  return {
    found: true,
    status: normalizeStatus(d.status),
    amount: Number(d.amount),
    currency: d.currency,
    txRef: d.tx_ref,
    mode: d.mode,
    method: d.method,
    reference: d.reference,
  };
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function isValidWebhook(req) {
  const secret =
    process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
  if (!secret) return false;

  const given = [
    req.get("x-chapa-signature"),
    req.get("chapa-signature"),
  ].filter(Boolean);
  if (given.length === 0) return false;

  const expected = [
    crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex"),
    crypto.createHmac("sha256", secret).update(secret).digest("hex"),
  ];
  return given.some((g) => expected.some((e) => safeEqual(g, e)));
}
