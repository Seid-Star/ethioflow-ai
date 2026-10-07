import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "0 ETB",
    period: "forever",
    description: "1 business, 1 user",
    features: [
      "Basic POS & inventory",
      "Customer credit ledger",
      "Up to 1 branch",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "—",
    period: "per month",
    description: "For growing shops",
    features: [
      "Multiple users",
      "AI Advisor & reports",
      "Advanced inventory & analytics",
      "Offline-first sync",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "—",
    period: "per month",
    description: "For multi-branch businesses",
    features: [
      "Multiple branches",
      "API integration",
      "Advanced analytics & support",
      "Priority onboarding",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-cream-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold-600">
            PRICING
          </p>
          <h2 className="mb-4 text-3xl font-bold text-forest-950 sm:text-4xl">
            Simple pricing, built to grow with you
          </h2>
          <p className="text-ink-900/60">
            Start free. Upgrade only when your business needs more.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 ${
                plan.highlighted
                  ? "bg-forest-950 text-white ring-2 ring-gold-500"
                  : "border border-black/5 bg-white text-ink-900"
              }`}
            >
              {plan.highlighted && (
                <p className="mb-3 inline-block rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-forest-950">
                  Most Popular
                </p>
              )}
              <h3 className="mb-1 text-lg font-bold">{plan.name}</h3>
              <p
                className={`mb-4 text-sm ${plan.highlighted ? "text-white/60" : "text-ink-900/50"}`}
              >
                {plan.description}
              </p>
              <p className="mb-5">
                <span className="text-3xl font-bold">{plan.price}</span>{" "}
                <span
                  className={`text-sm ${plan.highlighted ? "text-white/50" : "text-ink-900/40"}`}
                >
                  {plan.period}
                </span>
              </p>
              <ul className="mb-7 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-gold-500" : "text-forest-700"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`block rounded-full py-2.5 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-gold-500 text-forest-950 hover:bg-gold-600"
                    : "border border-forest-900 text-forest-900 hover:bg-forest-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-ink-900/40">
          Subscription billing runs in demo mode for the competition build.
        </p>
      </div>
    </section>
  );
}
