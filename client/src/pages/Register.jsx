import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, MailCheck, AlertTriangle } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { normalizePhone, formatPhone } from "../lib/phone";
import AuthShell from "../components/auth/AuthShell";
import PasswordInput from "../components/auth/PasswordInput";
import ResendVerification from "../components/auth/ResendVerification";

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-forest-700";
const PHONE_ERROR =
  "Enter a valid Ethiopian mobile number, for example 0911 234 567";

function Field({ label, children, hint }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-ink-900/80">
        {label}
      </label>
      {children}
      {hint}
    </div>
  );
}

export default function Register() {
  const [contact, setContact] = useState("email");
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const phonePreview = form.phone.trim() ? normalizePhone(form.phone) : null;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function problem() {
    if (contact === "email") {
      if (!form.email.trim()) return "Enter your email address";
      if (form.phone.trim() && !normalizePhone(form.phone)) return PHONE_ERROR;
    } else if (!normalizePhone(form.phone)) {
      return PHONE_ERROR;
    }
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = problem();
    if (found) {
      setError(found);
      return;
    }

    const payload = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      password: form.password,
    };
    if (contact === "email") {
      payload.email = form.email.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
    } else {
      payload.phone = form.phone.trim();
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", payload);
      if (data.needsVerification) {
        setSent(data);
      } else {
        setAuth(data.user, data.accessToken);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="text-center">
          <MailCheck size={44} className="mx-auto mb-3 text-forest-700" />
          <h1 className="mb-1 text-xl font-bold text-forest-950">
            Check your email
          </h1>
          <p className="mb-5 text-sm text-ink-900/60">
            {sent.emailSent
              ? "We sent a verification link to"
              : sent.mailReady
                ? "We couldn't send the email just now. Press Resend below. Your link goes to"
                : "This server cannot send email yet. The link for"}{" "}
            <span className="font-semibold text-forest-950">{sent.email}</span>
            {!sent.emailSent &&
              !sent.mailReady &&
              " was printed in the server terminal."}
          </p>

          {sent.emailSent && (
            <p className="mb-5 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-left text-xs text-amber-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Open the link to activate your account. If you can't see the
              email, look in your spam folder. The link works for 24 hours.
            </p>
          )}

          <ResendVerification
            email={sent.email}
            initialCooldown={sent.emailSent ? 60 : 0}
          />

          <Link
            to="/login"
            className="mt-5 block text-sm font-medium text-forest-700"
          >
            I've verified, take me to login
          </Link>
          <button
            type="button"
            onClick={() => setSent(null)}
            className="mt-3 text-xs text-ink-900/50 hover:text-ink-900/80"
          >
            Wrong email? Start again
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <h1 className="mb-1 text-2xl font-bold text-forest-950">
          Start your free trial
        </h1>
        <p className="mb-5 text-sm text-ink-900/60">
          Set up your business on EthioFlow AI
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <Field label="Business name">
          <input
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Your name">
          <input
            value={form.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            required
            autoComplete="name"
            className={inputClass}
          />
        </Field>

        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-ink-900/80">
            Sign up with
          </p>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1">
            {[
              { id: "email", label: "Email", icon: Mail },
              { id: "phone", label: "Phone number", icon: Phone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setContact(id);
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                  contact === id
                    ? "bg-white text-forest-950 shadow"
                    : "text-ink-900/55"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {contact === "email" && (
          <Field
            label="Email"
            hint={
              <p className="mt-1 text-[11px] text-ink-900/45">
                We'll send a link to confirm it. You can log in after you open
                it.
              </p>
            }
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              required
              className={inputClass}
            />
          </Field>
        )}

        <Field
          label={
            contact === "email" ? "Phone number (optional)" : "Phone number"
          }
          hint={
            form.phone.trim() ? (
              <p
                className={`mt-1 text-[11px] ${phonePreview ? "text-emerald-700" : "text-red-600"}`}
              >
                {phonePreview
                  ? `Will be saved as ${formatPhone(phonePreview)}`
                  : PHONE_ERROR}
              </p>
            ) : contact === "phone" ? (
              <p className="mt-1 text-[11px] text-ink-900/45">
                No email? No problem. You'll log in with this number.
              </p>
            ) : null
          }
        >
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="0911 234 567"
            autoComplete="tel"
            required={contact === "phone"}
            className={inputClass}
          />
        </Field>

        <Field label="Password">
          <PasswordInput
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mb-4 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-ink-900/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-forest-700">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
