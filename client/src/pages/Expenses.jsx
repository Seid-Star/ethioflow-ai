import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";

const categories = [
  "Rent",
  "Electricity",
  "Salary",
  "Transport",
  "Internet",
  "Maintenance",
  "Other",
];

const categoryTints = {
  Rent: "bg-violet-50 text-violet-700",
  Electricity: "bg-amber-50 text-amber-700",
  Salary: "bg-sky-50 text-sky-700",
  Transport: "bg-teal-50 text-teal-700",
  Internet: "bg-rose-50 text-rose-700",
  Maintenance: "bg-orange-50 text-orange-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    category: "Rent",
    amount: "",
    note: "",
    date: "",
  });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await api.get("/expenses");
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/expenses", form);
      setModalOpen(false);
      setForm({ category: "Rent", amount: "", note: "", date: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    load();
  }

  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Expenses</h1>
          <p className="text-sm text-ink-900/60">
            Rent, salary, utilities, and everything else it costs to run the
            shop
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-red-50 p-5">
        <p className="mb-1 text-xs uppercase tracking-wide text-red-700/70">
          This Month's Expenses
        </p>
        <p className="text-2xl font-bold text-red-700">
          {monthTotal.toLocaleString()} ETB
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No expenses recorded yet.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Recorded By</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id} className="border-t border-black/5">
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryTints[e.category]}`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {e.amount.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">{e.note || "—"}</td>
                  <td className="px-5 py-3 text-ink-900/50">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-ink-900/50">
                    {e.recordedBy?.name || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="rounded-lg p-1.5 hover:bg-red-50"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Expense"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Amount (ETB)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
            <p className="mt-1 text-[11px] text-ink-900/40">
              Leave blank to use today's date
            </p>
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Note (optional)
            </label>
            <input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Monthly bill"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Add Expense
          </button>
        </form>
      </Modal>
    </div>
  );
}
