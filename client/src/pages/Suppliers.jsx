import { useEffect, useState } from "react";
import { Plus, ChevronRight, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [payModal, setPayModal] = useState(null); // supplier being paid, or null
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [payAmount, setPayAmount] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const { data } = await api.get("/suppliers");
    setSuppliers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/suppliers", form);
      setModalOpen(false);
      setForm({ name: "", phone: "", address: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/suppliers/${payModal._id}/payments`, {
        amount: Number(payAmount),
      });
      setPayModal(null);
      setPayAmount("");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed");
    }
  }

  const totalOwed = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Suppliers</h1>
          <p className="text-sm text-ink-900/60">Where your stock comes from</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-amber-50 p-5">
        <p className="mb-1 text-xs uppercase tracking-wide text-amber-700/70">
          Total You Owe
        </p>
        <p className="text-2xl font-bold text-amber-700">
          {totalOwed.toLocaleString()} ETB
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : suppliers.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">No suppliers yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Total Purchased</th>
                <th className="px-5 py-3">Total Paid</th>
                <th className="px-5 py-3">Balance Owed</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {s.name}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {s.phone || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {s.totalPurchased.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    {s.totalPaid.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        s.outstandingBalance > 0
                          ? "font-semibold text-amber-600"
                          : "text-emerald-600"
                      }
                    >
                      {s.outstandingBalance.toLocaleString()} ETB
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {s.outstandingBalance > 0 && (
                      <button
                        onClick={() => setPayModal(s)}
                        className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5"
                      >
                        <Wallet size={13} /> Pay
                      </button>
                    )}
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
        title="Add Supplier"
      >
        <form onSubmit={handleAdd}>
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
            Add Supplier
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={!!payModal}
        onClose={() => setPayModal(null)}
        title={`Pay ${payModal?.name || ""}`}
      >
        <form onSubmit={handlePay}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <p className="mb-3 text-xs text-ink-900/60">
            You owe:{" "}
            <span className="font-semibold text-amber-600">
              {payModal?.outstandingBalance.toLocaleString()} ETB
            </span>
          </p>
          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Amount (ETB)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Record Payment
          </button>
        </form>
      </Modal>
    </div>
  );
}
