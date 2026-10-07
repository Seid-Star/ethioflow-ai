import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Boxes,
  LineChart,
  Users,
  Truck,
} from "lucide-react";
import { api } from "../api/axios";
import { exportCsv } from "../../../server/src/utils/exportCsv.js";

const tabs = [
  { key: "sales", label: "Sales", icon: FileText },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "financial", label: "Financial", icon: LineChart },
  { key: "customers", label: "Customers", icon: Users },
  { key: "suppliers", label: "Suppliers", icon: Truck },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;

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

  function handleExport() {
    if (activeTab === "financial") {
      exportCsv(`financial-report.csv`, [financial]);
    } else {
      exportCsv(`${activeTab}-report.csv`, rows);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Reports</h1>
          <p className="text-sm text-ink-900/60">
            Sales, inventory, financial, customer, and supplier reports
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          <Download size={16} /> Export CSV
        </button>
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

      {activeTab !== "inventory" &&
        activeTab !== "customers" &&
        activeTab !== "suppliers" && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3">
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
  const headers = Object.keys(rows[0]);
  return (
    <table className="w-full text-sm">
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
              <td key={h} className="px-5 py-3">
                {typeof row[h] === "number"
                  ? row[h].toLocaleString()
                  : h === "date"
                    ? new Date(row[h]).toLocaleDateString()
                    : row[h]}
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
  const rows = [
    ["Revenue", data.revenue],
    ["Cost of Goods Sold (COGS)", data.cogs],
    ["Gross Profit", data.grossProfit],
    ["Operating Expenses", data.operatingExpenses],
    ["Net Profit", data.netProfit],
    ["Cash In", data.cashFlow.cashIn],
    ["Cash Out", data.cashFlow.cashOut],
    ["Net Cash Flow", data.cashFlow.netCashFlow],
    ["Inventory Value", data.inventoryValue],
  ];
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-t border-black/5 first:border-t-0">
            <td className="px-5 py-3 text-ink-900/70">{label}</td>
            <td
              className={`px-5 py-3 text-right font-semibold ${
                typeof value === "number" && value < 0
                  ? "text-red-600"
                  : "text-forest-950"
              }`}
            >
              {value.toLocaleString()} ETB
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
