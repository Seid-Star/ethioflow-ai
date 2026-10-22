import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MailCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { normalizePhone, formatPhone } from "../lib/phone";
import AuthShell from "../components/auth/AuthShell";
import PasswordInput from "../components/auth/PasswordInput";
import ResendVerification from "../components/auth/ResendVerification";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition duration-300 focus:border-yellow-400/70 focus:bg-black/40 focus:ring-2 focus:ring-yellow-400/10";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

const PHONE_ERROR =
  "Enter a valid Ethiopian mobile number, for example 0911 234 567";

function Field({ label, children, hint }) {
  return (
    <div className="mb-5">
      <label className={labelClass}>{label}</label>
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
      if (form.phone.trim() && !normalizePhone(form.phone)) {
        return PHONE_ERROR;
      }
    } else if (!normalizePhone(form.phone)) {
      return PHONE_ERROR;
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

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

      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }
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
        <div className="animate-[fadeIn_0.5s_ease-out] text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10">
            <MailCheck size={32} className="text-yellow-400" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
            One last step
          </p>

          <h1 className="mb-3 text-2xl font-bold text-white">
            Check your email
          </h1>

          <p className="mb-6 text-sm leading-6 text-white/55">
            {sent.emailSent
              ? "We sent a verification link to"
              : sent.mailReady
                ? "We couldn't send the email just now. Press Resend below. Your link goes to"
                : "This server cannot send email yet. The link for"}{" "}
            <span className="break-all font-semibold text-yellow-400">
              {sent.email}
            </span>
            {!sent.emailSent &&
              !sent.mailReady &&
              " was printed in the server terminal."}
          </p>

          {sent.emailSent && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-left">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <p className="text-xs leading-5 text-amber-200/90">
                Open the link to activate your account. If you can't see the
                email, check your spam folder. The link works for 24 hours.
              </p>
            </div>
          )}

          <ResendVerification
            email={sent.email}
            initialCooldown={sent.emailSent ? 60 : 0}
          />

          <Link
            to="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-4 py-3 text-sm font-bold text-[#17120a] transition duration-300 hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)]"
          >
            I've verified, take me to login
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            onClick={() => setSent(null)}
            className="mt-4 text-xs text-white/45 transition hover:text-yellow-400"
          >
            Wrong email? Start again
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="animate-[fadeIn_0.5s_ease-out]">
        <div className="mb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Get started today
          </p>

          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            Create your <span className="text-yellow-400">account.</span>
          </h1>

          <p className="text-sm leading-6 text-white/50">
            Set up your business and experience EthioFlow AI.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <Field label="Business name">
          <input
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            autoComplete="organization"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Your name">
          <input
            value={form.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-white/75">Sign up with</p>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/20 p-1.5">
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
                aria-pressed={contact === id}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition duration-300 ${
                  contact === id
                    ? "bg-yellow-400 text-[#17120a] shadow-lg shadow-yellow-400/10"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {contact === "email" && (
          <Field
            label="Email address"
            hint={
              <p className="mt-2 text-xs leading-5 text-white/40">
                We'll send a verification link to confirm your email.
              </p>
            }
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
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
                className={`mt-2 flex items-start gap-1.5 text-xs leading-5 ${
                  phonePreview ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {phonePreview && (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                )}
                {phonePreview
                  ? `Will be saved as ${formatPhone(phonePreview)}`
                  : PHONE_ERROR}
              </p>
            ) : contact === "phone" ? (
              <p className="mt-2 text-xs leading-5 text-white/40">
                You'll use this number to log in to your account.
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
          <p className="mt-2 text-xs text-white/40">
            Use at least 6 characters.
          </p>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="group mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 py-3.5 text-sm font-bold text-[#17120a] shadow-[0_5px_25px_rgba(234,179,8,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(234,179,8,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create Account"}

          {!submitting && (
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </button>

        <p className="text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-yellow-400 transition-colors hover:text-yellow-200"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
