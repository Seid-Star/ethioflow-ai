export const TRIAL_DAYS = 14;
export const PLAN_ORDER = ["free", "basic", "professional", "enterprise"];

export const planAtLeast = (plan, min) =>
  PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(min);

export const PLANS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "For getting started",
    features: [
      "Up to 25 products",
      "POS, inventory & customer credit",
      "Offline-first sales sync",
      "Reports with CSV & PDF export",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    monthly: 299,
    yearly: 2990,
    description: "For a busy single shop",
    features: ["Up to 250 products", "Everything in Free"],
  },
  {
    id: "professional",
    name: "Professional",
    monthly: 799,
    yearly: 7990,
    description: "For shops that want answers",
    features: [
      "Unlimited products",
      "AI Business Advisor",
      "Receipt scanner (OCR)",
      "Everything in Basic",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 1999,
    yearly: 19990,
    description: "For multi-branch businesses",
    features: [
      "Everything in Professional",
      { text: "Multiple branches", soon: true },
      { text: "API integration", soon: true },
      { text: "Priority support", soon: true },
    ],
  },
];

export const planName = (id) => PLANS.find((p) => p.id === id)?.name || id;
export const priceFor = (plan, cycle) =>
  cycle === "yearly" ? plan.yearly : plan.monthly;
