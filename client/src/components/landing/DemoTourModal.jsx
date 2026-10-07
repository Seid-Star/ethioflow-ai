import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Users,
  Sparkles,
  WifiOff,
} from "lucide-react";

const slides = [
  {
    icon: ShoppingCart,
    title: "Sell in seconds",
    body: "Scan or search a product, build the cart, charge cash, mobile money, or split between several — stock updates the instant the sale completes.",
  },
  {
    icon: Users,
    title: "Track every birr owed",
    body: "Sell on credit to a trusted customer and it's logged like a bank ledger — purchases, payments, and a running balance, always up to date.",
  },
  {
    icon: Sparkles,
    title: "Ask your business a question",
    body: '"Why did my profit decrease?" "Who owes me money?" The AI Advisor answers in plain language, using your real numbers — never a guess.',
  },
  {
    icon: WifiOff,
    title: "Keeps working offline",
    body: "Internet drops don't stop the till. Sales save on the device and sync automatically the moment you're back online.",
  },
];

export default function DemoTourModal({ onClose }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-forest-950 p-8 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-500">
          <Icon size={26} />
        </div>

        <h3 className="mb-3 text-xl font-bold">{slide.title}</h3>
        <p className="mb-8 text-sm leading-relaxed text-white/70">
          {slide.body}
        </p>

        <div className="mb-6 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold-500" : "w-1.5 bg-white/25"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
            className="flex items-center gap-1 text-sm text-white/60 disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {index === slides.length - 1 ? (
            <a
              href="/register"
              className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-600"
            >
              Start Free Trial
            </a>
          ) : (
            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, slides.length - 1))
              }
              className="flex items-center gap-1 text-sm font-medium text-gold-500"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
