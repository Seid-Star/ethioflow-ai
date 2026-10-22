import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import { normalizePhone, formatPhone } from "../../lib/phone";
import { CONTACT } from "../../lib/contactInfo";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "demo", label: "Request a demo" },
  { value: "pricing", label: "Pricing and plans" },
  { value: "support", label: "Technical help" },
  { value: "partnership", label: "Partnership" },
];

const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-lg border border-white/15 bg-transparent px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-gold-500";

function buildChannels() {
  const channels = [];

  if (CONTACT.email)
    channels.push({
      key: "email",
      icon: Mail,
      label: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
    });

  if (CONTACT.phone) {
    const dial =
      normalizePhone(CONTACT.phone) || CONTACT.phone.replace(/\s+/g, "");
    channels.push({
      key: "phone",
      icon: Phone,
      label: CONTACT.phone,
      href: `tel:${dial}`,
    });
  }

  const whatsapp = normalizePhone(CONTACT.whatsapp);
  if (whatsapp) {
    channels.push({
      key: "whatsapp",
      icon: MessageCircle,
      label: "Chat on WhatsApp",
      href: `https://wa.me/${whatsapp.slice(1)}`,
      external: true,
    });
  }

  const telegram = String(CONTACT.telegram || "")
    .replace(/^https?:\/\/t\.me\//, "")
    .replace(/^@/, "");
  if (telegram) {
    channels.push({
      key: "telegram",
      icon: Send,
      label: `Telegram @${telegram}`,
      href: `https://t.me/${telegram}`,
      external: true,
    });
  }

  if (CONTACT.address)
    channels.push({ key: "address", icon: MapPin, label: CONTACT.address });
  if (CONTACT.hours)
    channels.push({ key: "hours", icon: Clock, label: CONTACT.hours });

  return channels;
}

const CHANNELS = buildChannels();

function Field({ id, label, hint, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-white/60"
      >
        {label}
      </label>
      {children}
      {hint}
    </div>
  );
}

export default function Contact() {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    topic: "general",
    message: "",
    website: "",
  }));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const phonePreview = form.phone.trim() ? normalizePhone(form.phone) : null;
  const sending = status === "sending";

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function findProblem() {
    if (form.name.trim().length < 2) return "Please tell us your name";
    if (!form.email.trim() && !form.phone.trim())
      return "Give us an email address or a phone number so we can reply";
    if (form.email.trim() && !EMAIL.test(form.email.trim()))
      return "Enter a valid email address";
    if (form.phone.trim() && !normalizePhone(form.phone))
      return "Enter a valid Ethiopian mobile number, for example 0911 234 567";
    if (form.message.trim().length < MIN_MESSAGE)
      return "Please write a little more so we can help (at least 10 characters)";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    const problem = findProblem();
    if (problem) {
      setError(problem);
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const { data } = await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        topic: form.topic,
        message: form.message.trim(),
        website: form.website,
      });
      setReceipt({
        reference: data.reference,
        via: form.email.trim() || formatPhone(normalizePhone(form.phone)),
      });
      setStatus("sent");
    } catch (err) {
      setError(
        err?.response
          ? err.response.data?.message ||
              "Something went wrong. Please try again."
          : "We couldn't reach the server. Check your internet connection and try again.",
      );
      setStatus("idle");
    }
  }

  function sendAnother() {
    setForm((current) => ({
      ...current,
      topic: "general",
      message: "",
      website: "",
    }));
    setReceipt(null);
    setError("");
    setStatus("idle");
  }

  return (
    <section id="contact" className="bg-forest-950 py-24 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold-500">
            CONTACT
          </p>
          <h2 className="mb-5 text-3xl font-bold sm:text-4xl">
            Let's talk about your business
          </h2>
          <p className="mb-8 max-w-md text-white/70">
            Questions about EthioFlow AI, or want a walkthrough for your shop?
            Send us a message and we'll get back to you.
          </p>

          {CHANNELS.length > 0 && (
            <ul className="space-y-4 text-sm text-white/80">
              {CHANNELS.map(({ key, icon: Icon, label, href, external }) => (
                <li key={key} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                    <Icon size={16} className="text-gold-500" />
                  </span>
                  {href ? (
                    <a
                      href={href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="transition hover:text-gold-500"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          {status === "sent" && receipt ? (
            <div className="py-6 text-center">
              <CheckCircle2
                size={48}
                className="mx-auto mb-4 text-emerald-400"
              />
              <h3 className="mb-2 text-xl font-bold">Message sent</h3>
              <p className="mb-1 text-sm text-white/70">
                Thank you. We'll reply to{" "}
                <span className="font-semibold text-white">{receipt.via}</span>.
              </p>
              <p className="mb-6 text-xs text-white/40">
                Reference{" "}
                <span className="font-mono text-white/60">
                  {receipt.reference}
                </span>
              </p>
              <button
                type="button"
                onClick={sendAnother}
                className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="contact-name" label="Your name">
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    className={inputClass}
                  />
                </Field>

                <Field id="contact-topic" label="What is this about?">
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => update("topic", e.target.value)}
                    className={inputClass}
                  >
                    {TOPICS.map((topic) => (
                      <option
                        key={topic.value}
                        value={topic.value}
                        className="text-ink-900"
                      >
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="contact-email" label="Email">
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="contact-phone"
                  label="Phone"
                  hint={
                    form.phone.trim() ? (
                      <p
                        className={`mt-1 text-[11px] ${phonePreview ? "text-emerald-300" : "text-red-300"}`}
                      >
                        {phonePreview
                          ? `We'll call ${formatPhone(phonePreview)}`
                          : "Enter a valid Ethiopian mobile number"}
                      </p>
                    ) : null
                  }
                >
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    autoComplete="tel"
                    placeholder="0911 234 567"
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="-mt-2 text-[11px] text-white/40">
                An email or a phone number is enough. We'll use whichever you
                give us.
              </p>

              <Field
                id="contact-message"
                label="Message"
                hint={
                  <p className="mt-1 text-right text-[11px] text-white/35">
                    {form.message.length}/{MAX_MESSAGE}
                  </p>
                }
              >
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    update("message", e.target.value.slice(0, MAX_MESSAGE))
                  }
                  placeholder="Tell us about your shop and what you'd like help with"
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-500/15 px-3 py-2.5 text-sm text-red-200 ring-1 ring-red-400/20"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
