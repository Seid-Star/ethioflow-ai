import { useEffect, useState } from "react";
import { ChevronDown, RotateCcw, Minus, Plus } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import Modal from "../components/ui/Modal";

const refundMethods = [
  { value: "cash", label: "Cash" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
];

function refundStatus(sale) {
  if (!sale.refundedTotal) return null;
  return sale.refundedTotal >= sale.total - 0.01
    ? "Fully refunded"
    : "Partially refunded";
}

function canRefund(sale) {
  return sale.items.some((i) => i.quantity - (i.refundedQuantity || 0) > 0);
}

export default function Sales() {
  const user = useAuthStore((s) => s.user);
  const canIssueRefunds = ["owner", "manager"].includes(user?.role);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/sales");
    setSales(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totalSold = sales.reduce((sum, s) => sum + s.total, 0);
  const totalRefunded = sales.reduce(
    (sum, s) => sum + (s.refundedTotal || 0),
    0,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest-950">Sales History</h1>
        <p className="text-sm text-ink-900/60">
          Every sale, with receipts and refunds
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-forest-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-900/50">
            Recent Sales
          </p>
          <p className="text-2xl font-bold text-forest-950">{sales.length}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-emerald-700/70">
            Total Sold
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {totalSold.toLocaleString()} ETB
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-amber-700/70">
            Refunded
          </p>
          <p className="text-2xl font-bold text-amber-700">
            {totalRefunded.toLocaleString()} ETB
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">No sales yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const status = refundStatus(s);
                const open = expandedId === s._id;
                return (
                  <FragmentRow key={s._id}>
                    <tr
                      className="cursor-pointer border-t border-black/5 hover:bg-forest-50/50"
                      onClick={() => setExpandedId(open ? null : s._id)}
                    >
                      <td className="px-5 py-3 text-ink-900/60">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-medium text-forest-950">
                        {s.customer?.name || "Walk-in"}
                      </td>
                      <td className="px-5 py-3 text-ink-900/60">
                        {s.items.length} item(s)
                      </td>
                      <td className="px-5 py-3 font-semibold">
                        {s.total.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3 capitalize text-ink-900/60">
                        {s.paymentMethod.replace("_", " ")}
                      </td>
                      <td className="px-5 py-3">
                        {status ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            {status}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <ChevronDown
                          size={16}
                          className={`text-ink-900/30 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </td>
                    </tr>

                    {open && (
                      <tr className="bg-forest-50/40">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                                Items
                              </p>
                              {s.items.map((i, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between py-1 text-sm"
                                >
                                  <span>
                                    {i.name} × {i.quantity}
                                    {i.refundedQuantity > 0 && (
                                      <span className="ml-2 text-xs text-amber-700">
                                        ({i.refundedQuantity} refunded)
                                      </span>
                                    )}
                                  </span>
                                  <span>
                                    {i.lineTotal.toLocaleString()} ETB
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="text-sm">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                                Summary
                              </p>
                              <div className="flex justify-between py-0.5 text-ink-900/60">
                                <span>Subtotal</span>
                                <span>{s.subtotal.toLocaleString()} ETB</span>
                              </div>
                              {s.discount > 0 && (
                                <div className="flex justify-between py-0.5 text-ink-900/60">
                                  <span>Discount</span>
                                  <span>
                                    -{s.discount.toLocaleString()} ETB
                                  </span>
                                </div>
                              )}
                              {s.pointsDiscount > 0 && (
                                <div className="flex justify-between py-0.5 text-gold-600">
                                  <span>
                                    Points discount ({s.pointsRedeemed} pts)
                                  </span>
                                  <span>
                                    -{s.pointsDiscount.toLocaleString()} ETB
                                  </span>
                                </div>
                              )}
                              {s.tax > 0 && (
                                <div className="flex justify-between py-0.5 text-ink-900/60">
                                  <span>Tax</span>
                                  <span>+{s.tax.toLocaleString()} ETB</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-black/10 py-1 font-semibold">
                                <span>Total</span>
                                <span>{s.total.toLocaleString()} ETB</span>
                              </div>
                              {s.refundedTotal > 0 && (
                                <div className="flex justify-between py-0.5 font-medium text-amber-700">
                                  <span>Refunded</span>
                                  <span>
                                    -{s.refundedTotal.toLocaleString()} ETB
                                  </span>
                                </div>
                              )}
                              <p className="mt-2 text-xs text-ink-900/45">
                                Cashier: {s.cashier?.name || "—"}
                              </p>

                              {canIssueRefunds && canRefund(s) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRefundTarget(s);
                                  }}
                                  className="mt-3 flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                >
                                  <RotateCcw size={13} /> Refund items
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {refundTarget && (
        <RefundModal
          sale={refundTarget}
          onClose={() => setRefundTarget(null)}
          onDone={() => {
            setRefundTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// Small helper so we can return two <tr> elements per sale without extra DOM wrappers
function FragmentRow({ children }) {
  return <>{children}</>;
}

function RefundModal({ sale, onClose, onDone }) {
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState("cash");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ratio = sale.subtotal > 0 ? sale.total / sale.subtotal : 1;
  const estimate = sale.items.reduce(
    (sum, i) => sum + (quantities[i.product] || 0) * i.unitPrice * ratio,
    0,
  );
  const methods = sale.customer
    ? [
        ...refundMethods,
        { value: "customer_credit", label: "Reduce customer balance" },
      ]
    : refundMethods;

  function change(productId, delta, max) {
    setQuantities((q) => ({
      ...q,
      [productId]: Math.min(max, Math.max(0, (q[productId] || 0) + delta)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (items.length === 0) {
      setError("Choose at least one item to refund");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/sales/${sale._id}/refund`, {
        items,
        reason,
        refundMethod: method,
      });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.message || "Refund failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Refund Items">
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4 space-y-2">
          {sale.items.map((i) => {
            const remaining = i.quantity - (i.refundedQuantity || 0);
            return (
              <div
                key={i.product}
                className="flex items-center justify-between rounded-xl border border-black/5 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-forest-950">
                    {i.name}
                  </p>
                  <p className="text-xs text-ink-900/50">
                    {remaining} of {i.quantity} refundable
                  </p>
                </div>
                {remaining > 0 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => change(i.product, -1, remaining)}
                      className="rounded-md border border-black/10 p-1 hover:bg-black/5"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm">
                      {quantities[i.product] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => change(i.product, 1, remaining)}
                      className="rounded-md border border-black/10 p-1 hover:bg-black/5"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-ink-900/40">
                    Fully refunded
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-ink-900/70">
            Refund via
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
          >
            {methods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink-900/70">
            Reason
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Damaged, wrong item"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
          />
        </div>

        <div className="mb-4 flex justify-between rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900">
          <span>Estimated refund</span>
          <span>{estimate.toFixed(2)} ETB</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Confirm Refund"}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-900/40">
          Items go back into stock and the sale's revenue is adjusted.
        </p>
      </form>
    </Modal>
  );
}
