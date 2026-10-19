import { useState } from "react";
import { Calculator, Banknote, Tag, Percent, X } from "lucide-react";
import BasicMode from "./BasicMode";
import ChangeMode from "./ChangeMode";
import PricingMode from "./PricingMode";
import TaxMode from "./TaxMode";

const TABS = [
  { id: "calc", label: "Calculate", icon: Calculator },
  { id: "change", label: "Change", icon: Banknote },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "tax", label: "Tax", icon: Percent },
];

export default function CalculatorPanel({ open, onClose }) {
  const [mode, setMode] = useState("calc");
  const [visited, setVisited] = useState({ calc: true });

  function choose(id) {
    setMode(id);
    setVisited((current) => ({ ...current, [id]: true }));
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white shadow-2xl ring-1 ring-white/10 sm:rounded-l-3xl">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-forest-700/40 blur-3xl" />

      <div className="relative flex items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-forest-950 shadow-lg shadow-gold-500/20">
            <Calculator size={20} />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold">Calculator</p>
            <p className="text-[11px] text-white/50">
              ካልኩሌተር · made for your shop
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close calculator"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="relative px-5 pb-3">
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-black/25 p-1 ring-1 ring-white/10">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => choose(id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition ${
                mode === id
                  ? "bg-gold-500 text-forest-950 shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-5 pb-6">
        <div className={mode === "calc" ? "" : "hidden"}>
          <BasicMode active={open && mode === "calc"} />
        </div>
        {visited.change && (
          <div className={mode === "change" ? "" : "hidden"}>
            <ChangeMode />
          </div>
        )}
        {visited.pricing && (
          <div className={mode === "pricing" ? "" : "hidden"}>
            <PricingMode />
          </div>
        )}
        {visited.tax && (
          <div className={mode === "tax" ? "" : "hidden"}>
            <TaxMode />
          </div>
        )}
        <p className="mt-6 text-center text-[11px] text-white/30">
          Alt + C opens or closes the calculator
        </p>
      </div>
    </div>
  );
}
