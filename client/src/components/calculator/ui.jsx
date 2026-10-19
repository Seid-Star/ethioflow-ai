import { useState } from "react";
import { Copy, Check } from "lucide-react";

export const sanitize = (value) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : cleaned;
};

export const num = (value) =>
  value === "" || value === "." ? 0 : Number(value);

export function ZigZag({ className = "" }) {
  const teeth = 28;
  const width = 280;
  const step = width / teeth;
  let path = "M0,0";
  for (let i = 0; i < teeth; i += 1) {
    path += ` L${(i + 0.5) * step},7 L${(i + 1) * step},0`;
  }
  path += " Z";

  return (
    <svg
      viewBox={`0 0 ${width} 7`}
      preserveAspectRatio="none"
      className={`block h-[7px] w-full ${className}`}
      aria-hidden="true"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export function CopyButton({ text, label, className = "" }) {
  const [copied, setCopied] = useState(false);
  const empty = text === undefined || text === null || text === "";

  async function copy() {
    if (empty) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={empty}
      aria-label="Copy"
      className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-30 ${className}`}
    >
      {copied ? (
        <Check size={14} className="text-emerald-300" />
      ) : (
        <Copy size={14} />
      )}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}

export function Field({ label, value, onChange, suffix, placeholder = "0" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
        {label}
      </span>
      <span className="flex items-center rounded-xl bg-black/20 px-4 ring-1 ring-white/10 transition focus-within:ring-gold-500/70">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(sanitize(e.target.value))}
          className="w-full bg-transparent py-3 text-xl font-semibold tabular-nums text-white outline-none placeholder:text-white/20"
        />
        {suffix && (
          <span className="ml-2 shrink-0 text-xs font-medium text-white/40">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex rounded-xl bg-black/20 p-1 ring-1 ring-white/10">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
            value === option.id
              ? "bg-gold-500 text-forest-950 shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const STAT_TONES = {
  plain: "bg-white/5 text-white",
  gold: "bg-gold-500/15 text-gold-500",
  good: "bg-emerald-400/10 text-emerald-300",
  bad: "bg-red-400/10 text-red-300",
};

export function Stat({ label, value, tone = "plain", hint }) {
  return (
    <div
      className={`rounded-2xl p-3.5 ring-1 ring-white/5 ${STAT_TONES[tone]}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider opacity-60">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] opacity-50">{hint}</p>}
    </div>
  );
}
