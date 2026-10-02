import { useEffect, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";
import { useNavigate } from "react-router-dom";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const { data } = await api.get("/customers");
    setCustomers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/customers", form);
      setModalOpen(false);
      setForm({ name: "", phone: "", address: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + c.outstandingBalance,
    0,
  );
  const withDebt = customers.filter((c) => c.outstandingBalance > 0).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Customers</h1>
          <p className="text-sm text-ink-900/60">
            Credit ledger — every birr tracked like a bank
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-red-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-red-700/70">
            Total Outstanding
          </p>
          <p className="text-2xl font-bold text-red-700">
            {totalOutstanding.toLocaleString()} ETB
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-amber-700/70">
            Customers With Debt
          </p>
          <p className="text-2xl font-bold text-amber-700">{withDebt}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No customers yet. Add your first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Total Purchased</th>
                <th className="px-5 py-3">Total Paid</th>
                <th className="px-5 py-3">Outstanding</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => navigate(`/dashboard/customers/${c._id}`)}
                  className="cursor-pointer border-t border-black/5 hover:bg-forest-50/50"
                >
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {c.name}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {c.phone || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {c.totalPurchased.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    {c.totalPaid.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        c.outstandingBalance > 0
                          ? "font-semibold text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {c.outstandingBalance.toLocaleString()} ETB
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <ChevronRight size={16} className="text-ink-900/30" />
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
        title="Add Customer"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Add Customer
          </button>
        </form>
      </Modal>
    </div>
  );
}
