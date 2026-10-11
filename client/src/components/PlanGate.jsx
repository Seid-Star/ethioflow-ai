import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useSubscription } from "../lib/useSubscription";
import { planAtLeast, planName } from "../lib/plans";

// Wraps a page that needs a higher plan. The server enforces this too; this is just the friendly screen.
export default function PlanGate({
  minPlan = "professional",
  feature,
  children,
}) {
  const { sub, loading } = useSubscription();

  if (loading) return <p className="text-sm text-ink-900/50">Loading...</p>;

  // If the plan couldn't be checked (offline, etc.), let the page load. The server still decides.
  if (!sub || planAtLeast(sub.plan, minPlan)) return children;

  const ended = sub.status === "expired";

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/5 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-600">
        <Lock size={24} />
      </div>
      <h1 className="mb-2 text-xl font-bold text-forest-950">
        {feature} is a {planName(minPlan)} feature
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-ink-900/60">
        {ended
          ? "Your trial has ended, so your account is on the Free plan. Choose a plan to get this back."
          : `You're on the ${planName(sub.plan)} plan. Upgrade to ${planName(minPlan)} to unlock it.`}
      </p>
      <Link
        to="/dashboard/subscription"
        className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
      >
        <Sparkles size={15} /> See plans
      </Link>
    </div>
  );
}
