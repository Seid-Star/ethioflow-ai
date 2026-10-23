import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { api } from "../api/axios";
import AuthShell from "../components/auth/AuthShell";
import PasswordInput from "../components/auth/PasswordInput";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const labelClass = "mb-2 block text-sm font-medium text-white/75";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      setError("This reset link is invalid. Please request a new one.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        password,
      });

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to reset your password. Please request a new link.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="animate-[fadeIn_0.5s_ease-out]">
        <Link
          to="/login"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-yellow-400"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="mb-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
            <KeyRound size={23} />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Account recovery
          </p>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">
            Create a new <span className="text-yellow-400">password.</span>
          </h1>

          <p className="text-sm leading-6 text-white/50">
            Choose a new password for your EthioFlow AI account.
          </p>
        </div>

        {success ? (
          <div>
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-6 text-emerald-300"
            >
              <CheckCircle2 size={19} className="mt-1 shrink-0" />
              <p>
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 py-3.5 text-sm font-bold text-[#17120a] transition hover:-translate-y-0.5"
            >
              Continue to login
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <div className="mb-5">
              <label htmlFor="new-password" className={labelClass}>
                New password
              </label>

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              <p className="mt-2 text-xs text-white/40">
                Use at least 8 characters.
              </p>
            </div>

            <div className="mb-7">
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm new password
              </label>

              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !token}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 py-3.5 text-sm font-bold text-[#17120a] shadow-[0_5px_25px_rgba(234,179,8,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(234,179,8,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Resetting password..." : "Reset password"}
              {!submitting && <ArrowRight size={17} />}
            </button>

            {!token && (
              <p className="mt-4 text-center text-sm text-amber-300">
                The reset token is missing. Please request a new link.
              </p>
            )}
          </form>
        )}
      </div>
    </AuthShell>
  );
}
