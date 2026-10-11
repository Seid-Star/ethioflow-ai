import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS, TRIAL_DAYS } from "../../lib/plans";

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
            Every new account starts with a {TRIAL_DAYS}-day Professional trial.
            No card needed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const highlighted = plan.id === "professional";
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl p-7 ${
                  highlighted
                    ? "bg-forest-950 text-white ring-2 ring-gold-500"
                    : "border border-black/5 bg-white text-ink-900"
                }`}
              >
                {highlighted && (
                  <p className="mb-3 inline-block self-start rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-forest-950">
                    Most Popular
                  </p>
                )}
                <h3 className="mb-1 text-lg font-bold">{plan.name}</h3>
                <p
                  className={`mb-4 text-sm ${highlighted ? "text-white/60" : "text-ink-900/50"}`}
                >
                  {plan.description}
                </p>
                <p className="mb-5">
                  <span className="text-3xl font-bold">
                    {plan.monthly.toLocaleString()}
                  </span>{" "}
                  <span
                    className={`text-sm ${highlighted ? "text-white/50" : "text-ink-900/40"}`}
                  >
                    ETB {plan.monthly === 0 ? "forever" : "/ month"}
                  </span>
                </p>
                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((item) => {
                    const f = typeof item === "string" ? { text: item } : item;
                    return (
                      <li
                        key={f.text}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check
                          size={16}
                          className={`mt-0.5 shrink-0 ${highlighted ? "text-gold-500" : "text-forest-700"}`}
                        />
                        <span>
                          {f.text}
                          {f.soon && (
                            <span
                              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${highlighted ? "bg-white/10 text-white/60" : "bg-forest-50 text-ink-900/45"}`}
                            >
                              soon
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  to="/register"
                  className={`block rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    highlighted
                      ? "bg-gold-500 text-forest-950 hover:bg-gold-600"
                      : "border border-forest-900 text-forest-900 hover:bg-forest-50"
                  }`}
                >
                  {plan.id === "free" ? "Start Free" : "Start Free Trial"}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-ink-900/40">
          Subscription billing runs in demo mode for the competition build.
        </p>
      </div>
    </section>
  );
}
