import { useEffect, useState } from "react";
import {
  Download,
  FileDown,
  FileText,
  Boxes,
  LineChart,
  Users,
  Truck,
} from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { exportCsv } from "../utils/exportCsv";

const tabs = [
  { key: "sales", label: "Sales", icon: FileText },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "financial", label: "Financial", icon: LineChart },
  { key: "customers", label: "Customers", icon: Users },
  { key: "suppliers", label: "Suppliers", icon: Truck },
];

const HIDDEN_KEYS = ["id"];

const fmt = (n) => Number(n || 0).toLocaleString();
const sum = (rows, key) =>
  rows.reduce((total, r) => total + (Number(r[key]) || 0), 0);
const todayStamp = () => new Date().toISOString().slice(0, 10);

// "To" must include the whole end day, and "From" starts at the beginning of its day
function toRangeParams(from, to) {
  const params = {};
  if (from) params.from = new Date(`${from}T00:00:00`).toISOString();
  if (to) params.to = new Date(`${to}T23:59:59.999`).toISOString();
  return params;
}

function financialRows(d) {
  return [
    ["Revenue (net of refunds)", d.revenue],
    ["Cost of Goods Sold (COGS)", d.cogs],
    ["Gross Profit", d.grossProfit],
    ["Operating Expenses", d.operatingExpenses],
    ["Net Profit", d.netProfit],
    ["Cash In", d.cashFlow.cashIn],
    ["Cash Out", d.cashFlow.cashOut],
    ["Net Cash Flow", d.cashFlow.netCashFlow],
    ["Inventory Value", d.inventoryValue],
  ];
}
const FINANCIAL_BOLD_ROWS = [2, 4, 7];

function summaryFor(tab, rows, financial) {
  switch (tab) {
    case "sales":
      return [
        ["Transactions", fmt(rows.length)],
        ["Total sales (ETB)", fmt(sum(rows, "total"))],
        ["Refunded (ETB)", fmt(sum(rows, "refunded"))],
      ];
    case "inventory":
      return [
        ["Products", fmt(rows.length)],
        ["Stock value (ETB)", fmt(sum(rows, "stockValue"))],
        [
          "Low stock items",
          fmt(rows.filter((r) => r.status === "Low Stock").length),
        ],
      ];
    case "customers":
      return [
        ["Customers", fmt(rows.length)],
        ["Total purchased (ETB)", fmt(sum(rows, "totalPurchased"))],
        ["Outstanding (ETB)", fmt(sum(rows, "outstandingBalance"))],
      ];
    case "suppliers":
      return [
        ["Suppliers", fmt(rows.length)],
        ["Total purchased (ETB)", fmt(sum(rows, "totalPurchased"))],
        ["Balance owed (ETB)", fmt(sum(rows, "outstandingBalance"))],
      ];
    case "financial":
      return financial
        ? [
            ["Revenue (ETB)", fmt(financial.revenue)],
            ["Net profit (ETB)", fmt(financial.netProfit)],
            ["Net cash flow (ETB)", fmt(financial.cashFlow.netCashFlow)],
          ]
        : [];
    default:
      return [];
  }
}

function subtitleFor(tab, from, to) {
  if (tab === "sales" || tab === "financial") {
    const range =
      from || to
        ? `Period: ${from || "beginning"} to ${to || "today"}`
        : "Period: all time";
    return `${range}  |  All amounts in ETB`;
  }
  return `Snapshot as of ${new Date().toLocaleDateString()}  |  All amounts in ETB`;
}

export default function Reports() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function load() {
    setLoading(true);
    const params = toRangeParams(from, to);

    if (activeTab === "financial") {
      const { data } = await api.get("/reports/financial-summary", { params });
      setFinancial(data);
    } else {
      const { data } = await api.get(`/reports/${activeTab}`, { params });
      setRows(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleExportCsv() {
    if (activeTab === "financial") {
      if (!financial) return;
      exportCsv(
        "financial-report.csv",
        financialRows(financial).map(([metric, amount]) => ({
          Metric: metric,
          "Amount (ETB)": amount,
        })),
      );
    } else {
      exportCsv(`${activeTab}-report.csv`, rows);
    }
  }

  async function handleExportPdf() {
    if (activeTab !== "financial" && rows.length === 0) {
      alert("Nothing to export for this period");
      return;
    }
    if (activeTab === "financial" && !financial) return;

    setExporting(true);
    try {
      // Loaded on demand so the PDF library doesn't slow down the rest of the app
      const { exportPdf, rowsToTable } = await import("../utils/exportPdf");
      const tabLabel = tabs.find((t) => t.key === activeTab).label;

      const common = {
        title: `${tabLabel} Report`,
        subtitle: subtitleFor(activeTab, from, to),
        summary: summaryFor(activeTab, rows, financial),
        preparedBy: user?.name,
        filename: `ethioflow-${activeTab}-report-${todayStamp()}.pdf`,
      };

      if (activeTab === "financial") {
        exportPdf({
          ...common,
          head: ["Item", "Amount (ETB)"],
          body: financialRows(financial).map(([label, value]) => [
            label,
            fmt(value),
          ]),
          numericCols: [1],
          boldRows: FINANCIAL_BOLD_ROWS,
        });
      } else {
        const { head, body, numericCols } = rowsToTable(rows, HIDDEN_KEYS);
        exportPdf({ ...common, head, body, numericCols });
      }
    } finally {
      setExporting(false);
    }
  }

  const showDateFilter = activeTab === "sales" || activeTab === "financial";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Reports</h1>
          <p className="text-sm text-ink-900/60">
            Sales, inventory, financial, customer, and supplier reports
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-forest-950 hover:bg-black/5"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-60"
          >
            <FileDown size={16} /> {exporting ? "Preparing..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === key
                ? "bg-forest-900 text-white"
                : "border border-black/10 text-ink-900/60 hover:bg-black/5"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {showDateFilter && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-white p-3">
          <label className="text-xs font-medium text-ink-900/60">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
          />
          <label className="text-xs font-medium text-ink-900/60">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
          />
          <button
            onClick={load}
            className="rounded-lg bg-forest-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Apply
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : activeTab === "financial" ? (
          <FinancialTable data={financial} />
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No data for this period.
          </p>
        ) : (
          <GenericTable rows={rows} />
        )}
      </div>
    </div>
  );
}

function GenericTable({ rows }) {
  const headers = Object.keys(rows[0]).filter((h) => !HIDDEN_KEYS.includes(h));
  return (
    <table className="w-full min-w-[640px] text-sm">
      <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-5 py-3">
              {h.replace(/([A-Z])/g, " $1")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-black/5">
            {headers.map((h) => (
              <td
                key={h}
                className={`px-5 py-3 ${h === "paymentMethod" ? "capitalize" : ""}`}
              >
                {typeof row[h] === "number"
                  ? row[h].toLocaleString()
                  : h === "date"
                    ? new Date(row[h]).toLocaleDateString()
                    : String(row[h]).replace(/_/g, " ")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FinancialTable({ data }) {
  if (!data) return null;
  return (
    <table className="w-full text-sm">
      <tbody>
        {financialRows(data).map(([label, value], i) => (
          <tr key={label} className="border-t border-black/5 first:border-t-0">
            <td
              className={`px-5 py-3 ${FINANCIAL_BOLD_ROWS.includes(i) ? "font-semibold text-forest-950" : "text-ink-900/70"}`}
            >
              {label}
            </td>
            <td
              className={`px-5 py-3 text-right font-semibold ${value < 0 ? "text-red-600" : "text-forest-950"}`}
            >
              {Number(value).toLocaleString()} ETB
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
