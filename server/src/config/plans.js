export const TRIAL_DAYS = 14;
export const PLAN_ORDER = ["free", "basic", "professional", "enterprise"];

export const PLANS = {
  free: { name: "Free", monthly: 0, yearly: 0, maxProducts: 25 },
  basic: { name: "Basic", monthly: 299, yearly: 2990, maxProducts: 250 },
  professional: {
    name: "Professional",
    monthly: 799,
    yearly: 7990,
    maxProducts: null,
  },
  enterprise: {
    name: "Enterprise",
    monthly: 1999,
    yearly: 19990,
    maxProducts: null,
  },
};
