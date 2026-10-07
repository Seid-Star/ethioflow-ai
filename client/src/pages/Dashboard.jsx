import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";
import StatCard from "../components/ui/StatCard";
import ForecastCard from "../components/ui/ForecastCard";
const PIE_COLORS = [
  "#135241",
  "#f5b83d",
  "#0e3b2e",
  "#e5a52a",
  "#06231c",
  "#d1a86a",
  "#8a9a93",
];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  // throw new Error("test");
  const [today, setToday] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const [todayRes, trendRes, expenseRes, productsRes, forecastRes] =
        await Promise.all([
          api.get("/reports/financial-summary", {
            params: { from: startOfToday() },
          }),
          api.get("/reports/daily-sales", { params: { from: daysAgo(13) } }),
          api.get("/reports/expenses-by-category", {
            params: { from: daysAgo(29) },
          }),
          api.get("/products"),
          api.get("/inventory/forecast"),
        ]);
      setForecasts(forecastRes.data.filter((f) => f.status !== "ok"));
      setToday(todayRes.data);
      setDailySales(
        trendRes.data.map((d) => ({
          date: new Date(d._id).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          total: d.total,
        })),
      );
      setExpenseBreakdown(
        expenseRes.data.map((e) => ({ name: e._id, value: e.total })),
      );
      setLowStockCount(
        productsRes.data.filter((p) => p.currentStock <= p.minStock).length,
      );
      setLoading(false);
    }
    loadAll();
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-forest-950">
        Good morning{user ? `, ${user.name}` : ""} 👋
      </h1>
      <p className="mb-6 text-ink-900/60">
        Here's what's happening with your business today.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Revenue"
          value={loading ? "..." : `${today.revenue.toLocaleString()} ETB`}
          note={
            loading
              ? ""
              : `${today.saleCount} sale${today.saleCount !== 1 ? "s" : ""}`
          }
        />
        <StatCard
          label="Today's Expenses"
          value={
            loading ? "..." : `${today.operatingExpenses.toLocaleString()} ETB`
          }
        />
        <StatCard
          label="Estimated Profit"
          value={loading ? "..." : `${today.netProfit.toLocaleString()} ETB`}
          tone="forest"
          note={
            !loading && today.netProfit < 0
              ? "Operating at a loss today"
              : undefined
          }
        />
        <StatCard
          label="Inventory Value"
          value={
            loading ? "..." : `${today.inventoryValue.toLocaleString()} ETB`
          }
          tone="gold"
        />
      </div>

      {!loading && forecasts.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-forest-950">
            Restock Alerts
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {forecasts.map((f) => (
              <ForecastCard key={f.productId} forecast={f} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-forest-950">
            Sales Trend (last 14 days)
          </p>
          {dailySales.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded-lg bg-forest-50">
              <p className="text-xs text-ink-900/40">
                No sales recorded in this period yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2ede8" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(v) => [`${v.toLocaleString()} ETB`, "Sales"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#135241"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-forest-950">
            Expense Breakdown (last 30 days)
          </p>
          {expenseBreakdown.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded-lg bg-forest-50">
              <p className="text-xs text-ink-900/40">
                No expenses recorded in this period yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v.toLocaleString()} ETB`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
