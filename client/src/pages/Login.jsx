import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, MailWarning, ArrowRight } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import AuthShell from "../components/auth/AuthShell";
import PasswordInput from "../components/auth/PasswordInput";
import ResendVerification from "../components/auth/ResendVerification";

export default function Login() {
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setUnverified("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      setAuth(data.user, data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      const data = err?.response?.data;

      if (data?.code === "EMAIL_NOT_VERIFIED") {
        setUnverified(data.email);
      } else {
        setError(data?.message || "Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition duration-300 focus:border-yellow-400/70 focus:bg-black/40 focus:ring-2 focus:ring-yellow-400/10";

  const labelClass = "mb-2 block text-sm font-medium text-white/75";

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="animate-[fadeIn_0.5s_ease-out]">
        <div className="mb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Welcome back
          </p>

          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            Sign in to your <span className="text-yellow-400">account.</span>
          </h1>

          <p className="text-sm leading-6 text-white/50">
            Continue managing your business with EthioFlow AI.
          </p>
        </div>

        {params.get("verified") === "1" && !error && !unverified && (
          <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={17} />
            Email verified. You can log in now.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {unverified && (
          <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="mb-3 flex items-start gap-2 text-sm leading-6 text-amber-200">
              <MailWarning size={17} className="mt-1 shrink-0" />
              <span>
                Please verify your email first. We sent a link to{" "}
                <b>{unverified}</b>.
              </span>
            </p>

            <ResendVerification email={unverified} />
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="login-identifier" className={labelClass}>
            Email or phone number
          </label>

          <input
            id="login-identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            placeholder="you@example.com or 0911 234 567"
            required
            className={inputClass}
          />
        </div>

        <div className="mb-7">
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass.replace("mb-2 ", "")}>Password</label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-yellow-400 transition-colors hover:text-yellow-200"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 py-3.5 text-sm font-bold text-[#17120a] shadow-[0_5px_25px_rgba(234,179,8,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(234,179,8,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Sign In"}

          {!submitting && (
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </button>

        <p className="mt-7 text-center text-sm text-white/50">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-yellow-400 transition-colors hover:text-yellow-200"
          >
            Start your free trial
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
