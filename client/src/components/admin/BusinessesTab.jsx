import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Ban,
  RotateCcw,
  Gift,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../api/axios";
import Modal from "../ui/Modal";

const PLAN_LABEL = {
  free: "Free",
  trial: "Trial",
  basic: "Basic",
  professional: "Professional",
  enterprise: "Enterprise",
};
const PLAN_STYLE = {
  free: "bg-gray-100 text-gray-700",
  trial: "bg-sky-100 text-sky-700",
  basic: "bg-teal-100 text-teal-700",
  professional: "bg-gold-500/25 text-forest-900",
  enterprise: "bg-forest-900 text-white",
};
const fmtDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");

export default function BusinessesTab() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [planTarget, setPlanTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const load = useCallback(async () => {
    setError("");
    try {
      const { data: result } = await api.get("/admin/businesses", {
        params: { q: query || undefined, page },
      });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load businesses");
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleUser(user) {
    setActionError("");
    try {
      await api.patch(`/admin/users/${user.id}/status`, {
        status: user.status === "active" ? "inactive" : "active",
      });
      load();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Could not update that account",
      );
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5">
        <Search size={16} className="text-ink-900/40" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search businesses by name..."
          className="w-full bg-transparent text-sm outline-none"
        />
        <span className="shrink-0 text-xs text-ink-900/40">
          {data.total} total
        </span>
      </div>

      {(error || actionError) && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error || actionError}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : data.items.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">No businesses found.</p>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Sales</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((b) => {
                const open = expandedId === b.id;
                return (
                  <Fragment key={b.id}>
                    <tr
                      className="cursor-pointer border-t border-black/5 hover:bg-forest-50/50"
                      onClick={() => setExpandedId(open ? null : b.id)}
                    >
                      <td className="px-5 py-3">
                        <p className="flex items-center gap-2 font-medium text-forest-950">
                          {b.name}
                          {b.suspended && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Suspended
                            </span>
                          )}
                          {b.isOwnBusiness && (
                            <span className="rounded-full bg-forest-50 px-2 py-0.5 text-[10px] font-semibold text-forest-700">
                              Yours
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-ink-900/45">{b.type}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-forest-950">
                          {b.owner?.name || "-"}
                        </p>
                        <p className="text-[11px] text-ink-900/45">
                          {b.owner?.email || b.owner?.phone || ""}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_STYLE[b.plan] || PLAN_STYLE.free}`}
                        >
                          {PLAN_LABEL[b.plan] || b.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3">{b.productCount}</td>
                      <td className="px-5 py-3">{b.saleCount}</td>
                      <td className="px-5 py-3 text-ink-900/55">
                        {fmtDate(b.createdAt)}
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
                        <td colSpan={7} className="px-5 py-5">
                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                                People
                              </p>
                              <div className="space-y-2">
                                {b.users.map((u) => (
                                  <div
                                    key={u.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-black/5"
                                  >
                                    <div className="min-w-0">
                                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-forest-950">
                                        {u.name}
                                        <span className="text-[11px] font-normal capitalize text-ink-900/45">
                                          {u.role}
                                        </span>
                                        {u.isPlatformAdmin && (
                                          <span className="flex items-center gap-1 rounded-full bg-gold-500/25 px-2 py-0.5 text-[10px] font-semibold text-forest-900">
                                            <ShieldCheck size={10} /> Admin
                                          </span>
                                        )}
                                        {u.emailVerified === false && (
                                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                            Email not verified
                                          </span>
                                        )}
                                        {u.status !== "active" && (
                                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                            Deactivated
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[11px] text-ink-900/45">
                                        {[u.email, u.phone]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </p>
                                    </div>
                                    {!u.isYou && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleUser(u);
                                        }}
                                        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink-900/70 hover:bg-black/5"
                                      >
                                        {u.status === "active"
                                          ? "Deactivate"
                                          : "Reactivate"}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                                Subscription
                              </p>
                              <div className="mb-3 space-y-1 rounded-xl bg-white px-4 py-3 text-xs ring-1 ring-black/5">
                                <p className="flex justify-between">
                                  <span className="text-ink-900/50">
                                    Status
                                  </span>
                                  <span className="font-medium capitalize text-forest-950">
                                    {b.subscriptionStatus}
                                  </span>
                                </p>
                                {b.trialEndsAt && b.plan === "trial" && (
                                  <p className="flex justify-between">
                                    <span className="text-ink-900/50">
                                      Trial ends
                                    </span>
                                    <span className="font-medium text-forest-950">
                                      {fmtDate(b.trialEndsAt)}
                                    </span>
                                  </p>
                                )}
                                {b.periodEnd &&
                                  b.plan !== "trial" &&
                                  b.plan !== "free" && (
                                    <p className="flex justify-between">
                                      <span className="text-ink-900/50">
                                        Paid until
                                      </span>
                                      <span className="font-medium text-forest-950">
                                        {fmtDate(b.periodEnd)}
                                      </span>
                                    </p>
                                  )}
                              </div>

                              {b.suspended && b.suspendedReason && (
                                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                                  Reason: {b.suspendedReason}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlanTarget(b);
                                  }}
                                  className="flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-forest-950 hover:bg-gold-600"
                                >
                                  <Gift size={13} /> Set plan
                                </button>
                                <button
                                  disabled={b.isOwnBusiness && !b.suspended}
                                  title={
                                    b.isOwnBusiness
                                      ? "You cannot suspend your own business"
                                      : ""
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSuspendTarget(b);
                                  }}
                                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold disabled:opacity-40 ${
                                    b.suspended
                                      ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                                      : "border-red-300 text-red-700 hover:bg-red-50"
                                  }`}
                                >
                                  {b.suspended ? (
                                    <RotateCcw size={13} />
                                  ) : (
                                    <Ban size={13} />
                                  )}
                                  {b.suspended ? "Reactivate" : "Suspend"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
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

      {suspendTarget && (
        <SuspendModal
          business={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onDone={load}
        />
      )}
      {planTarget && (
        <PlanModal
          business={planTarget}
          onClose={() => setPlanTarget(null)}
          onDone={load}
        />
      )}
    </div>
  );
}

function SuspendModal({ business, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const suspending = !business.suspended;

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/admin/businesses/${business.id}/suspend`, {
        suspended: suspending,
        reason,
      });
      onDone();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Could not update this business",
      );
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={
        suspending
          ? `Suspend ${business.name}?`
          : `Reactivate ${business.name}?`
      }
    >
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mb-4 text-sm leading-relaxed text-ink-900/65">
        {suspending
          ? "Nobody in this business will be able to log in. People who are already logged in are signed out within about 15 minutes. Their data is kept."
          : "People in this business will be able to log in again."}
      </p>
      {suspending && (
        <>
          <label className="mb-1 block text-xs font-medium text-ink-900/70">
            Reason (optional, only you see it)
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
            placeholder="e.g. Unpaid invoice, abuse report"
            className="mb-4 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
          />
        </>
      )}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-medium hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={busy}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${suspending ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {busy ? "Working..." : suspending ? "Suspend" : "Reactivate"}
        </button>
      </div>
    </Modal>
  );
}

function PlanModal({ business, onClose, onDone }) {
  const [plan, setPlan] = useState("professional");
  const [days, setDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await api.post(`/admin/businesses/${business.id}/grant-plan`, {
        plan,
        days: Number(days) || 30,
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not change the plan");
      setBusy(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`Set plan for ${business.name}`}>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mb-4 rounded-lg bg-forest-50 px-3 py-2 text-xs text-ink-900/60">
        This gives the plan without a payment, for support, demos or goodwill.
        It is recorded in the business's audit log.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {["free", "basic", "professional", "enterprise"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium capitalize ${
              plan === p
                ? "border-forest-700 bg-forest-50 text-forest-900"
                : "border-black/10 text-ink-900/60 hover:bg-black/5"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {plan !== "free" && (
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink-900/70">
            For how many days?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-24 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
            {[14, 30, 90, 365].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(String(d))}
                className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink-900/60 hover:bg-black/5"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={confirm}
        disabled={busy}
        className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-50"
      >
        {busy
          ? "Saving..."
          : plan === "free"
            ? "Reset to Free"
            : `Give ${plan} for ${Number(days) || 30} days`}
      </button>
    </Modal>
  );
}
