import { useMemo, useState } from "react";
import { RotateCcw, Banknote } from "lucide-react";
import { Field, CopyButton, num } from "./ui";
import { breakChange, quickAmounts, round2 } from "../../lib/birr";
import { formatMoney } from "../../lib/calcEngine";

const NOTE_STYLE = {
  200: "bg-rose-300 text-rose-950",
  100: "bg-orange-300 text-orange-950",
  50: "bg-emerald-300 text-emerald-950",
  10: "bg-amber-300 text-amber-950",
  5: "bg-violet-300 text-violet-950",
  1: "bg-slate-300 text-slate-900",
};

export default function ChangeMode() {
  const [due, setDue] = useState("");
  const [received, setReceived] = useState("");

  const dueAmount = num(due);
  const receivedAmount = num(received);
  const ready = due !== "" && received !== "";
  const change = round2(receivedAmount - dueAmount);
  const enough = ready && change >= 0;
  const short = ready && change < 0;
  const chips = useMemo(() => quickAmounts(dueAmount), [dueAmount]);
  const breakdown = useMemo(
    () => (enough ? breakChange(change) : null),
    [enough, change],
  );
  const noteCount = breakdown
    ? breakdown.notes.reduce((sum, note) => sum + note.count, 0)
    : 0;

  function reset() {
    setDue("");
    setReceived("");
  }

  return (
    <div className="space-y-4 pt-2">
      <Field label="Amount due" value={due} onChange={setDue} suffix="ETB" />
      <Field
        label="Cash received"
        value={received}
        onChange={setReceived}
        suffix="ETB"
      />

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((value, index) => (
            <button
              key={value}
              type="button"
              onClick={() => setReceived(String(value))}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition ${
                received === String(value)
                  ? "bg-gold-500 text-forest-950 ring-gold-500"
                  : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {index === 0 ? "Exact" : formatMoney(value)}
            </button>
          ))}
        </div>
      )}

      {!ready && (
        <div className="rounded-2xl bg-white/5 p-5 text-center ring-1 ring-white/10">
          <Banknote size={26} className="mx-auto mb-2 text-gold-500/70" />
          <p className="text-sm text-white/60">
            Enter the amount due and the cash received to see the change and
            which notes to hand back.
          </p>
        </div>
      )}

      {short && (
        <div className="rounded-2xl bg-red-400/10 p-5 ring-1 ring-red-400/20">
          <p className="text-[11px] font-medium uppercase tracking-wider text-red-300/80">
            Still owed by the customer
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-red-300">
            {formatMoney(Math.abs(change))}
          </p>
          <p className="text-xs text-red-300/60">ETB</p>
        </div>
      )}

      {enough && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 p-5 ring-1 ring-gold-500/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gold-500/80">
                  Change to give
                </p>
                <p className="mt-1 text-5xl font-bold tabular-nums text-gold-500">
                  {formatMoney(change)}
                </p>
                <p className="text-xs text-gold-500/60">ETB</p>
              </div>
              <CopyButton text={change} />
            </div>
          </div>

          {change === 0 ? (
            <p className="rounded-2xl bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-300 ring-1 ring-emerald-400/20">
              Exact amount. No change to give.
            </p>
          ) : (
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-white/50">
                Hand back{" "}
                {noteCount > 0
                  ? `${noteCount} note${noteCount === 1 ? "" : "s"}`
                  : "coins"}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                {breakdown.notes.map((note) => (
                  <div key={note.value} className="flex items-center gap-2">
                    <div
                      className={`flex h-12 w-20 items-center justify-center rounded-lg text-lg font-bold shadow-md ring-2 ring-inset ring-white/40 ${NOTE_STYLE[note.value]}`}
                    >
                      {note.value}
                    </div>
                    <span className="text-xl font-bold tabular-nums">
                      ×{note.count}
                    </span>
                  </div>
                ))}
                {breakdown.santim > 0 && (
                  <div className="rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium">
                    {breakdown.santim} santim
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {(due !== "" || received !== "") && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white"
        >
          <RotateCcw size={13} /> New customer
        </button>
      )}
    </div>
  );
}
