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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 border-b border-forest-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
          Sales History
        </h1>
        <p className="text-sm text-ink-900/60 sm:text-base">
          Every sale, with receipts and refunds
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-forest-100 bg-gradient-to-br from-forest-50 to-white p-4 shadow-sm sm:p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-900/50">
            Recent Sales
          </p>
          <p className="text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
            {sales.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm sm:p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/70">
            Total Sold
          </p>
          <p className="break-words text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">
            {totalSold.toLocaleString()} ETB
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm sm:p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700/70">
            Refunded
          </p>
          <p className="break-words text-2xl font-bold tracking-tight text-amber-700 sm:text-3xl">
            {totalRefunded.toLocaleString()} ETB
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-ink-900/50 sm:p-12">
            Loading...
          </p>
        ) : sales.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-900/50 sm:p-12">
            No sales yet.
          </p>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-forest-50 text-[11px] font-semibold uppercase tracking-wider text-forest-900/70">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5">
                    Customer
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5">
                    Items
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5">
                    Total
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5">
                    Payment
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 lg:px-5"></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const status = refundStatus(s);
                  const open = expandedId === s._id;
                  return (
                    <FragmentRow key={s._id}>
                      <tr
                        className="cursor-pointer border-t border-forest-100/70 transition-colors hover:bg-forest-50/70"
                        onClick={() => setExpandedId(open ? null : s._id)}
                      >
                        <td className="px-4 py-4 text-ink-900/60 lg:px-5">
                          {new Date(s.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 font-semibold text-forest-950 lg:px-5">
                          {s.customer?.name || "Walk-in"}
                        </td>
                        <td className="px-4 py-4 text-ink-900/60 lg:px-5">
                          {s.items.length} item(s)
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-forest-950 lg:px-5">
                          {s.total.toLocaleString()} ETB
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 capitalize text-ink-900/60 lg:px-5">
                          {s.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="px-4 py-4 lg:px-5">
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
                        <td className="px-4 py-4 lg:px-5">
                          <ChevronDown
                            size={16}
                            className={`text-ink-900/30 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </td>
                      </tr>

                      {open && (
                        <tr className="bg-forest-50/60">
                          <td colSpan={7} className="px-4 py-5 sm:px-6 sm:py-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
                              <div>
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-900/55">
                                  Items
                                </p>
                                {s.items.map((i, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start justify-between gap-4 border-b border-forest-100/70 py-2 text-sm last:border-0"
                                  >
                                    <span className="min-w-0 break-words">
                                      {i.name} × {i.quantity}
                                      {i.refundedQuantity > 0 && (
                                        <span className="ml-2 text-xs text-amber-700">
                                          ({i.refundedQuantity} refunded)
                                        </span>
                                      )}
                                    </span>
                                    <span className="shrink-0 whitespace-nowrap">
                                      {i.lineTotal.toLocaleString()} ETB
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-sm">
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-900/55">
                                  Summary
                                </p>
                                <div className="flex justify-between gap-4 py-1 text-ink-900/60">
                                  <span>Subtotal</span>
                                  <span>{s.subtotal.toLocaleString()} ETB</span>
                                </div>
                                {s.discount > 0 && (
                                  <div className="flex justify-between gap-4 py-1 text-ink-900/60">
                                    <span>Discount</span>
                                    <span>
                                      -{s.discount.toLocaleString()} ETB
                                    </span>
                                  </div>
                                )}
                                {s.pointsDiscount > 0 && (
                                  <div className="flex justify-between gap-4 py-1 text-gold-600">
                                    <span>
                                      Points discount ({s.pointsRedeemed} pts)
                                    </span>
                                    <span>
                                      -{s.pointsDiscount.toLocaleString()} ETB
                                    </span>
                                  </div>
                                )}
                                {s.tax > 0 && (
                                  <div className="flex justify-between gap-4 py-1 text-ink-900/60">
                                    <span>Tax</span>
                                    <span>+{s.tax.toLocaleString()} ETB</span>
                                  </div>
                                )}
                                <div className="mt-2 flex justify-between gap-4 border-t border-forest-200 pt-3 font-bold text-forest-950">
                                  <span>Total</span>
                                  <span>{s.total.toLocaleString()} ETB</span>
                                </div>
                                {s.refundedTotal > 0 && (
                                  <div className="flex justify-between gap-4 py-1 font-medium text-amber-700">
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
                                    className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
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
          </div>
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
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-5 max-h-[42vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[48vh]">
          {sale.items.map((i) => {
            const remaining = i.quantity - (i.refundedQuantity || 0);
            return (
              <div
                key={i.product}
                className="flex items-center justify-between gap-3 rounded-xl border border-forest-100 bg-white px-3 py-3 shadow-sm sm:px-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-forest-950">
                    {i.name}
                  </p>
                  <p className="mt-1 text-xs text-ink-900/55">
                    {remaining} of {i.quantity} refundable
                  </p>
                </div>
                {remaining > 0 ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => change(i.product, -1, remaining)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest-100 bg-forest-50 text-forest-900 transition-colors hover:bg-forest-100 focus:outline-none focus:ring-2 focus:ring-forest-300"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm">
                      {quantities[i.product] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => change(i.product, 1, remaining)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest-100 bg-forest-50 text-forest-900 transition-colors hover:bg-forest-100 focus:outline-none focus:ring-2 focus:ring-forest-300"
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

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-forest-900/80">
            Refund via
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-forest-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          >
            {methods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-forest-900/80">
            Reason
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Damaged, wrong item"
            className="min-h-11 w-full rounded-xl border border-forest-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3.5 text-sm font-bold text-amber-950">
          <span>Estimated refund</span>
          <span>{estimate.toFixed(2)} ETB</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-forest-950 shadow-sm transition-colors hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
