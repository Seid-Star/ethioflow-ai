import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { api } from "../api/axios";
import { notifySubscriptionChanged } from "../lib/useSubscription";
import Receipt from "../components/billing/Receipt";

const MAX_TRIES = 6;
const WAIT_MS = 3000;

export default function SubscriptionReturn() {
  const [params] = useSearchParams();
  const txRef = params.get("tx_ref") || params.get("trx_ref");
  const [state, setState] = useState({
    phase: "checking",
    invoice: null,
    businessName: "",
    error: "",
  });
  const runId = useRef(0);

  const verify = useCallback(async () => {
    const run = ++runId.current;
    setState((s) => ({ ...s, phase: "checking", error: "" }));

    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      try {
        const { data } = await api.post("/subscription/verify", { txRef });
        if (run !== runId.current) return;

        const status = data.invoice.status;
        if (status === "paid") {
          setState({
            phase: "paid",
            invoice: data.invoice,
            businessName: data.subscription?.businessName || "",
            error: "",
          });
          notifySubscriptionChanged();
          return;
        }
        if (status === "failed") {
          setState({
            phase: "failed",
            invoice: data.invoice,
            businessName: "",
            error: data.invoice.failureReason || "",
          });
          return;
        }
      } catch (err) {
        if (run !== runId.current) return;
        setState({
          phase: "error",
          invoice: null,
          businessName: "",
          error: err?.response?.data?.message || "Could not check the payment.",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
      if (run !== runId.current) return;
    }

    setState((s) => ({ ...s, phase: "pending" }));
  }, [txRef]);

  useEffect(() => {
    if (txRef) verify();
    return () => {
      runId.current += 1;
    };
  }, [txRef, verify]);

  const { phase, invoice, businessName, error } = state;

  if (phase === "paid") {
    return (
      <div className="mx-auto mt-6 max-w-md">
        <div className="mb-5 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-2 text-emerald-500" />
          <p className="text-xl font-bold text-forest-950">Payment confirmed</p>
          <p className="mt-1 text-sm text-ink-900/55">
            Your plan is active. A copy of this receipt is saved in Billing
            history.
          </p>
        </div>

        <Receipt invoice={invoice} businessName={businessName} />

        <Link
          to="/dashboard/subscription"
          className="mt-4 block rounded-full border border-forest-900 py-2.5 text-center text-sm font-semibold text-forest-900 hover:bg-forest-50"
        >
          Done
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/5 bg-white p-8 text-center">
      {!txRef ? (
        <>
          <AlertTriangle size={44} className="mx-auto mb-3 text-amber-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Nothing to check
          </p>
          <p className="mb-6 text-sm text-ink-900/55">
            This page needs a payment reference. Start from the Subscription
            page.
          </p>
        </>
      ) : phase === "checking" ? (
        <>
          <Loader2
            size={44}
            className="mx-auto mb-3 animate-spin text-forest-700"
          />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Confirming your payment
          </p>
          <p className="mb-6 text-sm text-ink-900/55">
            Checking with Chapa. This usually takes a few seconds.
          </p>
        </>
      ) : phase === "failed" ? (
        <>
          <XCircle size={48} className="mx-auto mb-3 text-red-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Payment didn't go through
          </p>
          <p className="mb-6 text-sm text-ink-900/55">
            {error || "Your plan was not changed. You can try again."}
          </p>
        </>
      ) : phase === "pending" ? (
        <>
          <Clock size={48} className="mx-auto mb-3 text-amber-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Still waiting for confirmation
          </p>
          <p className="mb-6 text-sm text-ink-900/55">
            Chapa has not confirmed this payment yet. If you finished paying,
            wait a minute and press Check again. You can also check later from
            Billing history.
          </p>
        </>
      ) : (
        <>
          <AlertTriangle size={44} className="mx-auto mb-3 text-amber-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Could not check the payment
          </p>
          <p className="mb-6 text-sm text-ink-900/55">{error}</p>
        </>
      )}

      <div className="flex gap-2">
        {txRef && ["pending", "error", "failed"].includes(phase) && (
          <button
            onClick={verify}
            className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-medium hover:bg-black/5"
          >
            Check again
          </button>
        )}
        <Link
          to="/dashboard/subscription"
          className="flex-1 rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          Back to plans
        </Link>
      </div>
    </div>
  );
}
