import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, MailWarning } from "lucide-react";
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
      if (data?.code === "EMAIL_NOT_VERIFIED") setUnverified(data.email);
      else setError(data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <h1 className="mb-1 text-2xl font-bold text-forest-950">
          Welcome back
        </h1>
        <p className="mb-6 text-sm text-ink-900/60">Log in to EthioFlow AI</p>

        {params.get("verified") === "1" && !error && !unverified && (
          <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={15} /> Email verified. You can log in now.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {unverified && (
          <div className="mb-4 rounded-xl bg-amber-50 p-4">
            <p className="mb-3 flex items-start gap-2 text-sm text-amber-900">
              <MailWarning size={16} className="mt-0.5 shrink-0" />
              <span>
                Please verify your email first. We sent a link to{" "}
                <b>{unverified}</b>.
              </span>
            </p>
            <ResendVerification email={unverified} />
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-ink-900/80">
          Email or phone number
        </label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          placeholder="you@example.com or 0911 234 567"
          required
          className="mb-4 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-forest-700"
        />

        <label className="mb-1 block text-sm font-medium text-ink-900/80">
          Password
        </label>
        <div className="mb-6">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mb-4 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-sm text-ink-900/60">
          No account?{" "}
          <Link to="/register" className="font-medium text-forest-700">
            Start your free trial
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
