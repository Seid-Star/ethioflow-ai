import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
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
        setState({
          phase: data.already ? "already" : "success",
          message: "",
        }),
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
      <div className="animate-[fadeIn_0.5s_ease-out] text-center">
        {phase === "verifying" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10">
              <Loader2 size={32} className="animate-spin text-yellow-400" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
              Please wait
            </p>

            <h1 className="text-2xl font-bold text-white">
              Verifying your email
            </h1>

            <p className="mt-3 text-sm text-white/50">
              We're confirming your email address. This will only take a moment.
            </p>
          </>
        )}

        {(phase === "success" || phase === "already") && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <CheckCircle2 size={34} className="text-emerald-400" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              {phase === "already" ? "Already confirmed" : "Success"}
            </p>

            <h1 className="mb-3 text-2xl font-bold text-white">
              {phase === "already"
                ? "Email already verified"
                : "Email verified!"}
            </h1>

            <p className="mb-7 text-sm leading-6 text-white/50">
              Your email is confirmed. You can now log in to your EthioFlow AI
              account.
            </p>

            <Link
              to="/login?verified=1"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 py-3.5 text-sm font-bold text-[#17120a] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(234,179,8,0.25)]"
            >
              Log in to your account
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </>
        )}

        {phase === "failed" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
              <XCircle size={34} className="text-red-400" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Verification unsuccessful
            </p>

            <h1 className="mb-3 text-2xl font-bold text-white">
              Link not accepted
            </h1>

            <p role="alert" className="mb-6 text-sm leading-6 text-white/55">
              {message}
            </p>

            <div className="mb-4 text-left">
              <label
                htmlFor="verification-email"
                className="mb-2 block text-sm font-medium text-white/75"
              >
                Your email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="verification-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition duration-300 focus:border-yellow-400/70 focus:ring-2 focus:ring-yellow-400/10"
                />
              </div>
            </div>

            <ResendVerification email={email.trim()} />

            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-yellow-400"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
