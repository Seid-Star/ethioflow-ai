import { useEffect, useState } from "react";
import { ScrollText, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "sale", label: "Sales" },
  { key: "product", label: "Products" },
  { key: "inventory", label: "Inventory" },
  { key: "customer", label: "Customers" },
  { key: "supplier", label: "Suppliers" },
  { key: "purchase", label: "Purchases" },
  { key: "expense", label: "Expenses" },
  { key: "employee", label: "Employees" },
  { key: "subscription", label: "Billing" },
  { key: "auth", label: "Account" },
];

const CATEGORY_STYLES = {
  sale: "bg-emerald-100 text-emerald-700",
  product: "bg-sky-100 text-sky-700",
  inventory: "bg-violet-100 text-violet-700",
  customer: "bg-amber-100 text-amber-800",
  supplier: "bg-orange-100 text-orange-700",
  purchase: "bg-teal-100 text-teal-700",
  expense: "bg-rose-100 text-rose-700",
  employee: "bg-indigo-100 text-indigo-700",
  subscription: "bg-gold-500/20 text-forest-900",
  auth: "bg-gray-100 text-gray-700",
};

const categoryLabel = (action) =>
  CATEGORIES.find((c) => c.key === action.split(".")[0])?.label || action;

export default function AuditLog() {
  const role = useAuthStore((s) => s.user?.role);
  const allowed = ["owner", "manager"].includes(role);

  const [category, setCategory] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = { page, limit: 25 };
        if (category) params.category = category;
        if (range.from)
          params.from = new Date(`${range.from}T00:00:00`).toISOString();
        if (range.to)
          params.to = new Date(`${range.to}T23:59:59.999`).toISOString();
        const res = await api.get("/audit-logs", { params });
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled)
          setError(
            err?.response?.data?.message || "Could not load the audit log",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, category, range, allowed]);

  if (!allowed) {
    return (
      <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-black/5 bg-white p-8 text-center">
        <Lock size={28} className="mx-auto mb-3 text-ink-900/30" />
        <p className="font-semibold text-forest-950">
          Owners and managers only
        </p>
        <p className="mt-1 text-sm text-ink-900/55">
          The audit log shows who did what, so access is limited.
        </p>
      </div>
    );
  }

  function pickCategory(key) {
    setCategory(key);
    setPage(1);
  }

  function applyDates() {
    setRange({ from: fromInput, to: toInput });
    setPage(1);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-forest-950">
          <ScrollText className="text-gold-500" /> Audit Log
        </h1>
        <p className="text-sm text-ink-900/60">
          A permanent record of who did what, and when. Entries can't be edited
          or deleted.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => pickCategory(c.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
              category === c.key
                ? "bg-forest-900 text-white"
                : "border border-black/10 text-ink-900/60 hover:bg-black/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-white p-3">
        <label className="text-xs font-medium text-ink-900/60">From</label>
        <input
          type="date"
          value={fromInput}
          onChange={(e) => setFromInput(e.target.value)}
          className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
        />
        <label className="text-xs font-medium text-ink-900/60">To</label>
        <input
          type="date"
          value={toInput}
          onChange={(e) => setToInput(e.target.value)}
          className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
        />
        <button
          onClick={applyDates}
          className="rounded-lg bg-forest-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Apply
        </button>
        <span className="ml-auto text-xs text-ink-900/45">
          {data.total.toLocaleString()} event{data.total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : data.items.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No activity recorded for this filter yet.
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Who</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">What happened</th>
                <th className="px-5 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((log) => (
                <tr key={log._id} className="border-t border-black/5">
                  <td className="whitespace-nowrap px-5 py-3 text-ink-900/60">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-forest-950">
                      {log.user?.name || "Unknown user"}
                    </p>
                    <p className="text-[11px] capitalize text-ink-900/45">
                      {log.role}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLES[log.action.split(".")[0]] || "bg-gray-100 text-gray-700"}`}
                    >
                      {categoryLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-forest-950">{log.summary}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-900/45">
                    {log.ip || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-ink-900/55">
            Page {page} of {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
