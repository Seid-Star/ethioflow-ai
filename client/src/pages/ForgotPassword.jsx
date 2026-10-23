import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { api } from "../api/axios";
import AuthShell from "../components/auth/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition duration-300 focus:border-yellow-400/70 focus:bg-black/40 focus:ring-2 focus:ring-yellow-400/10";

  const labelClass = "mb-2 block text-sm font-medium text-white/75";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="animate-[fadeIn_0.5s_ease-out]">
        <Link
          to="/login"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-yellow-400"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="mb-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
            <Mail size={23} />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Account recovery
          </p>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">
            Forgot your <span className="text-yellow-400">password?</span>
          </h1>

          <p className="text-sm leading-6 text-white/50">
            Enter your registered email address. If an account exists, we will
            send you a link to reset your password.
          </p>
        </div>

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-6 text-emerald-300"
          >
            <CheckCircle2 size={19} className="mt-1 shrink-0" />
            <p>
              If an account exists for that email, a password reset link will be
              sent. Check your inbox.
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mb-6">
          <label htmlFor="reset-email" className={labelClass}>
            Email address
          </label>

          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={254}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 py-3.5 text-sm font-bold text-[#17120a] shadow-[0_5px_25px_rgba(234,179,8,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(234,179,8,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending request..." : "Send reset link"}
          {!submitting && <ArrowRight size={17} />}
        </button>

        <p className="mt-7 text-center text-sm text-white/50">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-yellow-400 transition-colors hover:text-yellow-200"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
