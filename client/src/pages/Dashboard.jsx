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
import { Sunrise } from "lucide-react";

const PIE_COLORS = [
  "#135241",
  "#f5b83d",
  "#0e3b2e",
  "#e5a52a",
  "#06231c",
  "#d1a86a",
  "#8a9a93",
];

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Addis_Ababa",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );

  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
}

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
  const [greeting, setGreeting] = useState(getGreeting);
  const [today, setToday] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function updateGreeting() {
      setGreeting(getGreeting());
    }

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadAll() {
      try {
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
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  return (
    <div className="min-h-screen space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-forest-950/10 bg-gradient-to-br from-forest-950 via-forest-950 to-[#1b604a] px-6 py-8 shadow-lg shadow-forest-950/10 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-yellow-400/15" />
        <div className="pointer-events-none absolute -right-4 -top-16 h-48 w-48 rounded-full border border-yellow-400/10" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Business Overview
          </p>

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {greeting}, {user?.name || "there"}!
            </h1>

            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-300/30 bg-gradient-to-br from-yellow-300/20 to-amber-600/10 shadow-[0_0_25px_rgba(245,184,61,0.15)]">
              <span className="absolute inset-1 rounded-xl bg-yellow-300/5" />
              <Sunrise
                className="relative h-7 w-7 text-yellow-300"
                strokeWidth={2}
              />
            </span>
          </div>

          <p className="max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Here's what's happening with your business today.
          </p>

          <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500" />
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-gold-600" />
          <h2 className="text-lg font-bold text-forest-950">
            Financial Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Today's Revenue"
            value={
              loading ? "..." : `${(today?.revenue ?? 0).toLocaleString()} ETB`
            }
            note={
              loading
                ? ""
                : `${today?.saleCount ?? 0} sale${today?.saleCount !== 1 ? "s" : ""}`
            }
          />

          <StatCard
            label="Today's Expenses"
            value={
              loading
                ? "..."
                : `${(today?.operatingExpenses ?? 0).toLocaleString()} ETB`
            }
          />

          <StatCard
            label="Estimated Profit"
            value={
              loading
                ? "..."
                : `${(today?.netProfit ?? 0).toLocaleString()} ETB`
            }
            tone="forest"
            note={
              !loading && (today?.netProfit ?? 0) < 0
                ? "Operating at a loss today"
                : undefined
            }
          />

          <StatCard
            label="Inventory Value"
            value={
              loading
                ? "..."
                : `${(today?.inventoryValue ?? 0).toLocaleString()} ETB`
            }
            tone="gold"
          />
        </div>
      </section>

      {!loading && forecasts.length > 0 && (
        <section className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m10.3 3.9-8 13.9A2 2 0 0 0 4 20.8h16a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-forest-950">
                Restock Alerts
              </h2>
              <p className="mt-1 text-xs text-ink-900/55">
                Products that may need your attention
              </p>
            </div>

            <span className="ml-auto rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-700">
              {forecasts.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {forecasts.map((f) => (
              <ForecastCard key={f.productId} forecast={f} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-gold-600" />
          <h2 className="text-lg font-bold text-forest-950">
            Business Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-forest-950/10 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-forest-950 sm:text-base">
                  Sales Trend
                </h3>
                <p className="mt-1 text-xs text-ink-900/50">
                  Your sales performance over the last 14 days
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-semibold text-forest-950">
                14 days
              </span>
            </div>

            {dailySales.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-forest-950/10 bg-forest-50/60 px-4 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest-950 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-5 5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-forest-950">
                  No sales data yet
                </p>
                <p className="mt-1 text-xs text-ink-900/50">
                  No sales recorded in this period yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={dailySales}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 5"
                    stroke="#e2ede8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#71817a" }}
                    stroke="#d5e1db"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#71817a" }}
                    stroke="#d5e1db"
                    tickLine={false}
                    axisLine={false}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2ede8",
                      boxShadow: "0 8px 24px rgba(6,35,28,0.08)",
                      fontSize: "12px",
                    }}
                    formatter={(v) => [`${v.toLocaleString()} ETB`, "Sales"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#135241"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill: "#135241",
                      strokeWidth: 2,
                      stroke: "#ffffff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#f5b83d",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-forest-950/10 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-forest-950 sm:text-base">
                  Expense Breakdown
                </h3>
                <p className="mt-1 text-xs text-ink-900/50">
                  Expenses by category over the last 30 days
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                30 days
              </span>
            </div>

            {expenseBreakdown.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-forest-950/10 bg-forest-50/60 px-4 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v9h9" />
                    <path d="M20.5 15A9 9 0 1 1 9 3.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-forest-950">
                  No expense data yet
                </p>
                <p className="mt-1 text-xs text-ink-900/50">
                  No expenses recorded in this period yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={48}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {expenseBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2ede8",
                      boxShadow: "0 8px 24px rgba(6,35,28,0.08)",
                      fontSize: "12px",
                    }}
                    formatter={(v) => [`${v.toLocaleString()} ETB`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
