import { useEffect, useState } from "react";
import { api } from "../api/axios";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function Finance() {
  const [range, setRange] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/financial-summary", { params: { from: daysAgo(range) } })
      .then(({ data }) => {
        setSummary(data);
        setLoading(false);
      });
  }, [range]);

  if (loading || !summary)
    return <p className="text-sm text-ink-900/50">Loading...</p>;

  const rows = [
    { label: "Revenue", value: summary.revenue, tone: "text-forest-950" },
    {
      label: "Cost of Goods Sold (COGS)",
      value: -summary.cogs,
      tone: "text-red-600",
    },
    {
      label: "Gross Profit",
      value: summary.grossProfit,
      tone: "text-forest-950",
      bold: true,
    },
    {
      label: "Operating Expenses",
      value: -summary.operatingExpenses,
      tone: "text-red-600",
    },
    {
      label: "Net Profit",
      value: summary.netProfit,
      tone: summary.netProfit < 0 ? "text-red-600" : "text-emerald-700",
      bold: true,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Finance</h1>
          <p className="text-sm text-ink-900/60">
            Profit &amp; loss, cash flow
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6">
        <p className="mb-4 text-sm font-semibold text-forest-950">
          Profit &amp; Loss
        </p>
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`flex justify-between border-b border-black/5 pb-3 last:border-0 ${row.bold ? "pt-2 text-base" : "text-sm"}`}
            >
              <span
                className={
                  row.bold ? "font-semibold text-forest-950" : "text-ink-900/70"
                }
              >
                {row.label}
              </span>
              <span className={`font-semibold ${row.tone}`}>
                {row.value.toLocaleString()} ETB
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-forest-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-900/50">
            Cash In
          </p>
          <p className="text-xl font-bold text-forest-950">
            {summary.cashFlow.cashIn.toLocaleString()} ETB
          </p>
        </div>
        <div className="rounded-2xl bg-red-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-red-700/70">
            Cash Out
          </p>
          <p className="text-xl font-bold text-red-700">
            {summary.cashFlow.cashOut.toLocaleString()} ETB
          </p>
        </div>
        <div
          className={`rounded-2xl p-5 ${summary.cashFlow.netCashFlow >= 0 ? "bg-emerald-50" : "bg-red-50"}`}
        >
          <p
            className={`mb-1 text-xs uppercase tracking-wide ${summary.cashFlow.netCashFlow >= 0 ? "text-emerald-700/70" : "text-red-700/70"}`}
          >
            Net Cash Flow
          </p>
          <p
            className={`text-xl font-bold ${summary.cashFlow.netCashFlow >= 0 ? "text-emerald-700" : "text-red-700"}`}
          >
            {summary.cashFlow.netCashFlow.toLocaleString()} ETB
          </p>
        </div>
      </div>
    </div>
  );
}
