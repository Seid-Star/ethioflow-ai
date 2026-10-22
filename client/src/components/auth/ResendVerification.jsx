import { useEffect, useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { api } from "../../api/axios";

export default function ResendVerification({ email, initialCooldown = 0 }) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    setSending(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/resend-verification", { email });

      setMessage(
        "A new link is on its way. Check your inbox and your spam folder.",
      );

      setCooldown(60);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not send the email. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {message && (
        <p
          role="status"
          className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-sm leading-5 text-emerald-300"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={resend}
        disabled={sending || cooldown > 0 || !email}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-3 text-sm font-semibold text-yellow-400 transition duration-300 hover:border-yellow-400/60 hover:bg-yellow-400/10 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Mail size={16} />

        {sending
          ? "Sending..."
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend verification email"}
      </button>
    </div>
  );
}
