import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get(`/customers/${id}`);
    setCustomer(data);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handlePayment(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/customers/${id}/payments`, {
        amount: Number(amount),
        note,
      });
      setModalOpen(false);
      setAmount("");
      setNote("");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed");
    }
  }

  if (!customer) return <p className="text-sm text-ink-900/50">Loading...</p>;

  const sortedLedger = [...customer.ledger].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard/customers")}
        className="mb-4 flex items-center gap-1 text-sm text-ink-900/60 hover:text-forest-900"
      >
        <ArrowLeft size={14} /> Back to Customers
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">
            {customer.name}
          </h1>
          <p className="text-sm text-ink-900/60">
            {customer.phone || "No phone on file"}
          </p>
        </div>
        {customer.outstandingBalance > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            <Wallet size={16} /> Record Payment
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-forest-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-900/50">
            Total Purchased
          </p>
          <p className="text-xl font-bold text-forest-950">
            {customer.totalPurchased.toLocaleString()} ETB
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-emerald-700/70">
            Total Paid
          </p>
          <p className="text-xl font-bold text-emerald-700">
            {customer.totalPaid.toLocaleString()} ETB
          </p>
        </div>
        <div
          className={`rounded-2xl p-5 ${customer.outstandingBalance > 0 ? "bg-red-50" : "bg-forest-50"}`}
        >
          <p
            className={`mb-1 text-xs uppercase tracking-wide ${customer.outstandingBalance > 0 ? "text-red-700/70" : "text-ink-900/50"}`}
          >
            Outstanding
          </p>
          <p
            className={`text-xl font-bold ${customer.outstandingBalance > 0 ? "text-red-700" : "text-forest-950"}`}
          >
            {customer.outstandingBalance.toLocaleString()} ETB
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-forest-950">
        Transaction Timeline
      </h2>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {sortedLedger.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-black/5">
            {sortedLedger.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-forest-950">
                    {entry.type === "purchase" ? "Purchase" : "Payment"}
                    {entry.note && (
                      <span className="ml-2 text-xs font-normal text-ink-900/50">
                        {entry.note}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-900/40">
                    {new Date(entry.date).toLocaleString()}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${entry.type === "purchase" ? "text-red-600" : "text-emerald-600"}`}
                >
                  {entry.type === "purchase" ? "+" : "−"}
                  {entry.amount.toLocaleString()} ETB
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment"
      >
        <form onSubmit={handlePayment}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <p className="mb-3 text-xs text-ink-900/60">
            Outstanding balance:{" "}
            <span className="font-semibold text-red-600">
              {customer.outstandingBalance.toLocaleString()} ETB
            </span>
          </p>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Amount (ETB)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Partial payment"
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
