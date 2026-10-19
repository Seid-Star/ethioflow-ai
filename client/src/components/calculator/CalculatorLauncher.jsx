import { useCallback, useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import CalculatorPanel from "./CalculatorPanel";

export default function CalculatorLauncher() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    if (!mounted) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
      return;
    }
    setOpen((value) => !value);
  }, [mounted]);

  useEffect(() => {
    function onKey(e) {
      if (e.altKey && e.code === "KeyC") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="Open calculator"
        className={`group fixed bottom-5 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-forest-950 shadow-xl shadow-gold-500/30 ring-4 ring-gold-500/20 transition duration-300 hover:scale-105 lg:left-72 ${
          open ? "pointer-events-none scale-75 opacity-0" : ""
        }`}
      >
        <Calculator size={24} />
        <span className="pointer-events-none absolute left-16 whitespace-nowrap rounded-lg bg-forest-950 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
          Calculator <span className="ml-1 text-white/50">Alt+C</span>
        </span>
      </button>

      {mounted && (
        <>
          <div
            onClick={() => setOpen(false)}
            className={`fixed inset-0 z-[59] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
          <aside
            inert={!open}
            aria-hidden={!open}
            className={`fixed inset-y-0 right-0 z-[60] w-full max-w-[26rem] transition-transform duration-300 ease-out ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <CalculatorPanel open={open} onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
