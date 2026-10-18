import "dotenv/config";
import crypto from "crypto";

const key = (process.env.CHAPA_SECRET_KEY || "").trim();

if (!key) {
  console.log("CHAPA_SECRET_KEY is empty, so there is nothing to test.");
  process.exit(0);
}

console.log(
  `Key shape: starts with "${key.slice(0, 9)}", ${key.length} characters\n`,
);

const ref = () =>
  `EF-CHECK-${Date.now().toString(36)}-${crypto.randomBytes(2).toString("hex")}`.toUpperCase();
const messageOf = (body) =>
  typeof body?.message === "string"
    ? body.message
    : JSON.stringify(body?.message ?? body);

async function initialize(payload) {
  const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

const refC = ref();
const variants = [
  ["A. bare minimum", { amount: "299", currency: "ETB", tx_ref: ref() }],
  [
    "B. with customer details",
    {
      amount: "299",
      currency: "ETB",
      tx_ref: ref(),
      email: "test@example.com",
      first_name: "Test",
      last_name: "Owner",
    },
  ],
  [
    "C. exactly like the app",
    {
      amount: "299",
      currency: "ETB",
      tx_ref: refC,
      email: "test@example.com",
      first_name: "Test",
      last_name: "Owner",
      return_url: `http://localhost:5173/dashboard/subscription/return?tx_ref=${refC}`,
      customization: {
        title: "EthioFlow AI",
        description: "Basic plan monthly",
      },
    },
  ],
];

let worked = 0;
for (const [label, payload] of variants) {
  try {
    const { status, body } = await initialize(payload);
    if (status < 300 && body?.data?.checkout_url) {
      worked += 1;
      console.log(`${label}: OK, Chapa created a checkout link`);
    } else {
      console.log(
        `${label}: FAILED (HTTP ${status})\n   Chapa says: ${messageOf(body)}`,
      );
    }
  } catch (err) {
    console.log(`${label}: could not reach Chapa (${err.message})`);
  }
}

console.log(
  worked === 3
    ? "\n=> All three worked. The key and account are fine. Restart the server so it picks up the current .env."
    : worked === 0
      ? "\n=> Chapa refuses to create any payment with this key. That is a problem with the key or the Chapa account itself, not with this app."
      : "\n=> Some versions work and some do not. Paste this output and I will fix the app.",
);
