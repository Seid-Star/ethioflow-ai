import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
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
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={resend}
        disabled={sending || cooldown > 0 || !email}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-forest-900 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Mail size={15} />
        {sending
          ? "Sending..."
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend verification email"}
      </button>
    </div>
  );
}
