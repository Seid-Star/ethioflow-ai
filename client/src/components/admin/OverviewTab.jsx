import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  UserPlus,
  Inbox,
  Database,
  Clock,
} from "lucide-react";
import { api } from "../../api/axios";

const PLAN_META = [
  { key: "free", label: "Free", bar: "bg-gray-300" },
  { key: "trial", label: "Trial", bar: "bg-sky-400" },
  { key: "basic", label: "Basic", bar: "bg-teal-500" },
  { key: "professional", label: "Professional", bar: "bg-gold-500" },
  { key: "enterprise", label: "Enterprise", bar: "bg-forest-700" },
];

const REVENUE = [
  {
    key: "live",
    label: "Live payments",
    note: "Real money received through Chapa",
    tone: "bg-emerald-50 text-emerald-800",
  },
  {
    key: "test",
    label: "Test payments",
    note: "Chapa test mode, no real money",
    tone: "bg-amber-50 text-amber-800",
  },
  {
    key: "demo",
    label: "Demo billing",
    note: "Recorded without a payment provider",
    tone: "bg-gray-100 text-gray-700",
  },
];

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "bg-forest-50 text-forest-950",
}) {
  return (
    <div className={`rounded-2xl p-5 ${tone}`}>
      <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide opacity-60">
        <Icon size={13} /> {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function OverviewTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/summary")
      .then(({ data }) => !cancelled && setData(data))
      .catch(
        (err) =>
          !cancelled &&
          setError(
            err?.response?.data?.message || "Could not load the overview",
          ),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        {error}
      </p>
    );
  if (!data) return <p className="text-sm text-ink-900/50">Loading...</p>;

  const planTotal =
    Object.values(data.plans).reduce((sum, n) => sum + n, 0) || 1;
  const connected = data.health.database === "connected";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={Building2}
          label="Businesses"
          value={data.businesses.toLocaleString()}
        />
        <Stat icon={Users} label="Users" value={data.users.toLocaleString()} />
        <Stat
          icon={UserPlus}
          label="New this week"
          value={data.newBusinesses7d}
          tone="bg-emerald-50 text-emerald-800"
        />
        <Stat
          icon={Inbox}
          label="Unread messages"
          value={data.messages.new}
          tone={
            data.messages.new > 0
              ? "bg-gold-500/20 text-forest-950"
              : "bg-forest-50 text-forest-950"
          }
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-forest-950">
          Plans across all businesses
        </h2>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-black/5">
            {PLAN_META.map(
              (plan) =>
                data.plans[plan.key] > 0 && (
                  <div
                    key={plan.key}
                    className={plan.bar}
                    style={{
                      width: `${(data.plans[plan.key] / planTotal) * 100}%`,
                    }}
                  />
                ),
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {PLAN_META.map((plan) => (
              <div key={plan.key} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${plan.bar}`} />
                <span className="text-xs text-ink-900/60">{plan.label}</span>
                <span className="ml-auto text-sm font-bold text-forest-950">
                  {data.plans[plan.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-forest-950">
          Subscription revenue
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {REVENUE.map((item) => (
            <div key={item.key} className={`rounded-2xl p-5 ${item.tone}`}>
              <p className="text-xs uppercase tracking-wide opacity-70">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {data.revenue[item.key].amount.toLocaleString()} ETB
              </p>
              <p className="mt-1 text-[11px] opacity-70">
                {data.revenue[item.key].count} payment
                {data.revenue[item.key].count === 1 ? "" : "s"} · {item.note}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-900/45">
          Only live payments are real money. Test and demo amounts are never
          counted as income.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-forest-950">
            Recent activity across the platform
          </h2>
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            {data.recentActivity.length === 0 ? (
              <p className="p-6 text-sm text-ink-900/50">No activity yet.</p>
            ) : (
              <div className="divide-y divide-black/5">
                {data.recentActivity.map((item) => (
                  <div key={item.id} className="px-5 py-3">
                    <p className="text-sm text-forest-950">{item.summary}</p>
                    <p className="mt-0.5 text-[11px] text-ink-900/45">
                      {item.user} · {item.business} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-forest-950">System</h2>
          <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-ink-900/60">
                <Database size={14} /> Database
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${connected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
              >
                {data.health.database}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-ink-900/60">
                <Clock size={14} /> Server uptime
              </span>
              <span className="font-medium text-forest-950">
                {formatUptime(data.health.uptimeSeconds)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-900/60">Node.js</span>
              <span className="font-mono text-xs text-forest-950">
                {data.health.node}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-900/60">New in 30 days</span>
              <span className="font-medium text-forest-950">
                {data.newBusinesses30d} businesses
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
