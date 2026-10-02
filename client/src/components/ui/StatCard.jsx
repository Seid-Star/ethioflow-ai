export default function StatCard({ label, value, tone = "default", note }) {
  const tones = {
    default: "bg-white border-black/5",
    forest: "bg-forest-900 text-white border-forest-900",
    gold: "bg-gold-500 text-forest-950 border-gold-500",
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <p
        className={`mb-1 text-xs uppercase tracking-wide ${tone === "default" ? "text-ink-900/50" : "opacity-70"}`}
      >
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
      {note && (
        <p
          className={`mt-1 text-xs ${tone === "default" ? "text-ink-900/40" : "opacity-60"}`}
        >
          {note}
        </p>
      )}
    </div>
  );
}
