import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { useSubscription } from "../../lib/useSubscription";
import { planName } from "../../lib/plans";

export default function PlanBadge() {
  const { sub } = useSubscription();
  if (!sub) return null;

  const trial = sub.status === "trialing";
  const free = sub.plan === "free";
  const date = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString()
    : "";

  const line = trial
    ? `Trial - ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? "" : "s"} left`
    : free
      ? "Limited features"
      : sub.status === "canceled"
        ? `Ends ${date}`
        : `Renews ${date}`;

  return (
    <Link
      to="/dashboard/subscription"
      className="mx-3 mb-4 block rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10 transition hover:bg-white/10"
    >
      <div className="flex items-center gap-2">
        <Crown size={14} className="text-gold-500" />
        <p className="text-sm font-semibold text-white">{planName(sub.plan)}</p>
      </div>
      <p className="mt-1 text-[11px] text-white/55">{line}</p>
      {(trial || free) && (
        <p className="mt-2 text-[11px] font-semibold text-gold-500">
          {free ? "Upgrade" : "Choose a plan"} &rarr;
        </p>
      )}
    </Link>
  );
}
