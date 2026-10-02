import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";
import StatCard from "../components/ui/StatCard";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary").then(({ data }) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-forest-950">
        Good morning{user ? `, ${user.name}` : ""} 👋
      </h1>
      <p className="mb-6 text-ink-900/60">
        Here's what's happening with your business today.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value="—"
          note="Coming Day 16 (POS required first)"
        />
        <StatCard label="Estimated Profit" value="—" note="Coming Day 16" />
        <StatCard
          label="Total Products"
          value={loading ? "..." : summary.totalProducts}
          tone="forest"
        />
        <StatCard
          label="Inventory Value"
          value={
            loading
              ? "..."
              : `${summary.totalInventoryValue.toLocaleString()} ETB`
          }
          tone="gold"
        />
      </div>

      {!loading && summary.lowStockCount > 0 && (
        <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            ⚠ {summary.lowStockCount} product
            {summary.lowStockCount > 1 ? "s are" : " is"} at or below minimum
            stock.
          </p>
          <p className="text-xs text-red-600/70">
            Check the Inventory page to restock.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-forest-950">
            Sales Trend
          </p>
          <div className="flex h-40 items-center justify-center rounded-lg bg-forest-50">
            <p className="text-xs text-ink-900/40">
              Chart appears once POS sales exist (Day 16)
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-forest-950">
            Expense Breakdown
          </p>
          <div className="flex h-40 items-center justify-center rounded-lg bg-forest-50">
            <p className="text-xs text-ink-900/40">
              Chart appears once expenses exist (Day 14)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
