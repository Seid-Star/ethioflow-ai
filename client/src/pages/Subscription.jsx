import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  CreditCard,
  Smartphone,
  Landmark,
  Receipt,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import {
  useSubscription,
  notifySubscriptionChanged,
} from "../lib/useSubscription";
import { PLANS, priceFor, planName } from "../lib/plans";
import Modal from "../components/ui/Modal";

const methods = [
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { value: "card", label: "Card", icon: CreditCard },
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

export default function Subscription() {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === "owner";
  const { sub, loading } = useSubscription();
  const [cycle, setCycle] = useState("monthly");
  const [invoices, setInvoices] = useState([]);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function loadInvoices() {
    try {
      const { data } = await api.get("/subscription/invoices");
      setInvoices(data);
    } catch {
      // the invoice list is a nice-to-have; the page still works without it
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  function afterChange() {
    notifySubscriptionChanged();
    loadInvoices();
  }

  if (loading || !sub)
    return <p className="text-sm text-ink-900/50">Loading...</p>;

  const statusLine =
    sub.status === "trialing"
      ? `Free trial - ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? "" : "s"} left`
      : sub.status === "active"
        ? `Active - renews ${fmtDate(sub.currentPeriodEnd)}`
        : sub.status === "canceled"
          ? `Cancelled - access until ${fmtDate(sub.currentPeriodEnd)}`
          : "Your trial or subscription has ended";

  const limit = sub.limits.maxProducts;
  const usedPct = limit
    ? Math.min(100, Math.round((sub.usage.products / limit) * 100))
    : 0;

  function buttonFor(plan) {
    if (plan.id === "free") {
      if (sub.plan === "free") return { label: "Current plan", disabled: true };
      return {
        label:
          sub.status === "trialing" ? "End trial, use Free" : "Cancel plan",
        disabled: false,
        free: true,
      };
    }
    if (
      sub.status === "active" &&
      sub.paidPlan === plan.id &&
      sub.billingCycle === cycle
    ) {
      return { label: "Current plan", disabled: true };
    }
    if (sub.status === "canceled" && sub.paidPlan === plan.id)
      return { label: "Resubscribe", disabled: false };
    if (sub.status === "trialing" && plan.id === "professional")
      return { label: "Subscribe to keep", disabled: false };
    return { label: `Choose ${plan.name}`, disabled: false };
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest-950">Subscription</h1>
        <p className="text-sm text-ink-900/60">
          Your plan, usage, and billing history
        </p>
      </div>

      {/* Current plan */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-forest-950 to-forest-700 p-6 text-white">
        <Crown
          size={110}
          className="absolute -right-4 -top-4 text-gold-500/10"
        />
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gold-500">
          Current plan
        </p>
        <p className="text-3xl font-bold">{planName(sub.plan)}</p>
        <p className="mt-1 text-sm text-white/70">{statusLine}</p>

        <div className="mt-5 max-w-sm">
          <div className="mb-1.5 flex justify-between text-xs text-white/70">
            <span>Products</span>
            <span>
              {sub.usage.products} / {limit ?? "unlimited"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className={`h-full rounded-full ${usedPct >= 90 ? "bg-red-400" : "bg-gold-500"}`}
              style={{ width: limit ? `${usedPct}%` : "8%" }}
            />
          </div>
        </div>
      </div>

      {!isOwner && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={15} /> Only the business owner can change the
          plan.
        </p>
      )}

      {/* Billing cycle toggle */}
      <div className="mb-5 flex items-center justify-center gap-1 self-center">
        <div className="flex rounded-full border border-black/10 bg-white p-1">
          {["monthly", "yearly"].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium capitalize ${
                cycle === c ? "bg-forest-900 text-white" : "text-ink-900/60"
              }`}
            >
              {c}
              {c === "yearly" && (
                <span className="ml-1.5 text-[10px] font-semibold text-gold-500">
                  2 months free
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const btn = buttonFor(plan);
          const highlighted = plan.id === "professional";
          const isCurrent = plan.id === sub.plan;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl p-6 ${
                highlighted
                  ? "bg-forest-950 text-white ring-2 ring-gold-500"
                  : "border border-black/5 bg-white"
              } ${isCurrent && !highlighted ? "ring-2 ring-forest-700" : ""}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {isCurrent && (
                  <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-semibold text-forest-950">
                    Current
                  </span>
                )}
              </div>
              <p
                className={`mb-4 text-sm ${highlighted ? "text-white/60" : "text-ink-900/50"}`}
              >
                {plan.description}
              </p>
              <p className="mb-5">
                <span className="text-3xl font-bold">
                  {priceFor(plan, cycle).toLocaleString()}
                </span>{" "}
                <span
                  className={`text-sm ${highlighted ? "text-white/50" : "text-ink-900/40"}`}
                >
                  ETB{" "}
                  {plan.monthly === 0
                    ? ""
                    : cycle === "yearly"
                      ? "/ year"
                      : "/ month"}
                </span>
              </p>
              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((item) => {
                  const f = typeof item === "string" ? { text: item } : item;
                  return (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${highlighted ? "text-gold-500" : "text-forest-700"}`}
                      />
                      <span>
                        {f.text}
                        {f.soon && (
                          <span
                            className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${highlighted ? "bg-white/10 text-white/60" : "bg-forest-50 text-ink-900/45"}`}
                          >
                            soon
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                disabled={btn.disabled || !isOwner}
                onClick={() =>
                  btn.free ? setCancelOpen(true) : setCheckoutPlan(plan)
                }
                className={`rounded-full py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  highlighted
                    ? "bg-gold-500 text-forest-950 hover:bg-gold-600"
                    : "border border-forest-900 text-forest-900 hover:bg-forest-50"
                }`}
              >
                {btn.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing history */}
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-forest-950">
        <Receipt size={14} /> Billing history
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">No invoices yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-t border-black/5">
                  <td className="px-5 py-3 text-ink-900/60">
                    {fmtDate(inv.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {inv.reference}
                  </td>
                  <td className="px-5 py-3 capitalize">
                    {inv.plan} ({inv.billingCycle})
                  </td>
                  <td className="px-5 py-3 capitalize text-ink-900/60">
                    {inv.paymentMethod.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">
                    {inv.amount.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Paid{inv.mode === "demo" ? " (demo)" : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          cycle={cycle}
          onClose={() => setCheckoutPlan(null)}
          onDone={afterChange}
        />
      )}

      {cancelOpen && (
        <CancelModal
          sub={sub}
          onClose={() => setCancelOpen(false)}
          onDone={afterChange}
        />
      )}
    </div>
  );
}

function CheckoutModal({ plan, cycle, onClose, onDone }) {
  const [method, setMethod] = useState("mobile_money");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState(null);
  const amount = priceFor(plan, cycle);

  async function pay() {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/subscription/checkout", {
        plan: plan.id,
        billingCycle: cycle,
        paymentMethod: method,
      });
      setInvoice(data.invoice);
      onDone();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (invoice) {
    return (
      <Modal isOpen onClose={onClose} title="Payment complete">
        <div className="text-center">
          <CheckCircle2 size={44} className="mx-auto mb-3 text-emerald-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            You're on {plan.name}
          </p>
          <p className="mb-4 text-sm text-ink-900/55">
            Reference <span className="font-mono">{invoice.reference}</span>
          </p>
          <p className="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Demo mode: no real payment was taken.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={`Subscribe to ${plan.name}`}>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mb-4 space-y-1.5 rounded-xl bg-forest-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-900/60">Plan</span>
          <span className="font-medium">{plan.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-900/60">Billing</span>
          <span className="font-medium capitalize">{cycle}</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-1.5 text-base font-bold text-forest-950">
          <span>Total</span>
          <span>{amount.toLocaleString()} ETB</span>
        </div>
      </div>

      <p className="mb-2 text-xs font-medium text-ink-900/70">Pay with</p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {methods.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMethod(value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium ${
              method === value
                ? "border-forest-700 bg-forest-50 text-forest-900"
                : "border-black/10 text-ink-900/60 hover:bg-black/5"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Demo mode: this records an invoice but charges nothing.
      </p>

      <button
        onClick={pay}
        disabled={submitting}
        className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-50"
      >
        {submitting
          ? "Processing..."
          : `Pay ${amount.toLocaleString()} ETB (demo)`}
      </button>
    </Modal>
  );
}

function CancelModal({ sub, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const trial = sub.status === "trialing";

  async function confirm() {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/subscription/cancel");
      onDone();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not cancel");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={trial ? "End your trial?" : "Cancel your plan?"}
    >
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mb-5 text-sm leading-relaxed text-ink-900/65">
        {trial
          ? "You will move to the Free plan right away. The AI Advisor and receipt scanner will be locked, and you can add up to 25 products."
          : `Your ${planName(sub.paidPlan)} plan keeps working until ${fmtDate(sub.currentPeriodEnd)}, then moves to Free.`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-medium hover:bg-black/5"
        >
          Keep my plan
        </button>
        <button
          onClick={confirm}
          disabled={submitting}
          className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? "Working..." : trial ? "End trial" : "Cancel plan"}
        </button>
      </div>
    </Modal>
  );
}
