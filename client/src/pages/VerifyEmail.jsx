import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "../api/axios";
import AuthShell from "../components/auth/AuthShell";
import ResendVerification from "../components/auth/ResendVerification";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState({
    phase: token ? "verifying" : "failed",
    message: token ? "" : "This verification link is not valid",
  });
  const [email, setEmail] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    api
      .post("/auth/verify-email", { token })
      .then(({ data }) =>
        setState({ phase: data.already ? "already" : "success", message: "" }),
      )
      .catch((err) =>
        setState({
          phase: "failed",
          message:
            err?.response?.data?.message ||
            "We could not verify this link. Please try again.",
        }),
      );
  }, [token]);

  const { phase, message } = state;

  return (
    <AuthShell>
      <div className="text-center">
        {phase === "verifying" && (
          <>
            <Loader2
              size={44}
              className="mx-auto mb-3 animate-spin text-forest-700"
            />
            <h1 className="text-xl font-bold text-forest-950">
              Verifying your email
            </h1>
            <p className="mt-1 text-sm text-ink-900/55">One moment...</p>
          </>
        )}

        {(phase === "success" || phase === "already") && (
          <>
            <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500" />
            <h1 className="mb-1 text-xl font-bold text-forest-950">
              {phase === "already" ? "Already verified" : "Email verified"}
            </h1>
            <p className="mb-6 text-sm text-ink-900/55">
              Your email is confirmed. You can log in now.
            </p>
            <Link
              to="/login?verified=1"
              className="block rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
            >
              Log in
            </Link>
          </>
        )}

        {phase === "failed" && (
          <>
            <XCircle size={48} className="mx-auto mb-3 text-red-500" />
            <h1 className="mb-1 text-xl font-bold text-forest-950">
              Link not accepted
            </h1>
            <p className="mb-5 text-sm text-ink-900/55">{message}</p>

            <label className="mb-1 block text-left text-sm font-medium text-ink-900/80">
              Your email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-3 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-forest-700"
            />
            <ResendVerification email={email.trim()} />

            <Link
              to="/login"
              className="mt-5 block text-sm font-medium text-forest-700"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
