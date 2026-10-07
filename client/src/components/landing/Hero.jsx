import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Play,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  BarChart3,
  Sparkles,
} from "lucide-react";
import DemoTourModal from "./DemoTourModal";

const pillars = [
  { icon: Sparkles, label: "AI Business\nAdvisor" },
  { icon: BarChart3, label: "Offline-First\nPOS" },
  { icon: Users, label: "Customer\nCredit Ledger" },
  { icon: Wallet, label: "Financial\nInclusion" },
];

const posMenu = [
  { icon: ShoppingCart, label: "Sales" },
  { icon: Package, label: "Inventory" },
  { icon: Users, label: "Customers" },
  { icon: Wallet, label: "Expenses" },
  { icon: BarChart3, label: "Reports" },
];

export default function Hero() {
  const { t } = useTranslation();
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 pb-24 pt-32 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-10">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center text-left">
          <p
            className="animate-fade-up mb-3 text-xs font-semibold tracking-wide text-gold-500"
            style={{ animationDelay: "0ms" }}
          >
            {t("landing.eyebrow")}
          </p>

          <h1
            className="animate-fade-up mb-2 text-5xl leading-tight"
            style={{ animationDelay: "80ms" }}
          >
            ብልህ ንግድ
          </h1>

          <h2
            className="animate-fade-up mb-6 text-4xl font-bold leading-tight"
            style={{ animationDelay: "140ms" }}
          >
            EthioFlow <span className="text-gold-500">AI</span>
          </h2>

          <p
            className="animate-fade-up mb-8 max-w-md text-white/80"
            style={{ animationDelay: "200ms" }}
          >
            {t("landing.subtitle")}
          </p>

          {/* Pillars */}
          <div
            className="animate-fade-up mb-9 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4"
            style={{ animationDelay: "260ms" }}
          >
            {pillars.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon size={16} className="text-gold-500" />
                </div>

                <p className="whitespace-pre-line text-xs leading-tight text-white/85">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div
            className="animate-fade-up flex items-center gap-6"
            style={{ animationDelay: "320ms" }}
          >
            <a
              href="/register"
              className="flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-600"
            >
              {t("landing.startTrial")}
              <ArrowRight size={16} />
            </a>

            <button
              onClick={() => setTourOpen(true)}
              className="group flex items-center gap-3 text-sm text-white/85 transition hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition group-hover:border-gold-500 group-hover:bg-gold-500/10">
                <Play size={14} className="ml-0.5" />
              </span>

              <span className="text-left leading-tight">
                {t("landing.watchDemo")}
                <br />
                <span className="text-white/60">{t("landing.demoLength")}</span>
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex items-center justify-center">
          {/* Main image container */}
          <div className="group relative flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm sm:h-96">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-amber-400/10" />

            {/* Glow behind image */}
            <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl transition-all duration-700 group-hover:scale-125" />

            {/* Image */}
            <img
              src="/image.png"
              alt="EthioFlow AI"
              className="relative z-10 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105 animate-[float_5s_ease-in-out_infinite]"
            />
          </div>

          {/* POS Menu Card */}
          <div className="animate-float absolute -left-6 top-6 hidden w-40 rounded-2xl bg-forest-900/95 p-2 shadow-xl ring-1 ring-white/10 sm:block">
            {posMenu.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                  i === 0 ? "bg-forest-700 text-white" : "text-white/70"
                }`}
              >
                <Icon size={14} />
                {label}
              </div>
            ))}
          </div>

          {/* AI Advisor Card */}
          <div
            className="animate-float absolute -right-4 -top-8 hidden max-w-[220px] rounded-2xl bg-forest-700/95 p-4 text-xs shadow-xl ring-1 ring-white/10 sm:block"
            style={{ animationDelay: "1.2s" }}
          >
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-gold-500">
              <Sparkles size={12} />
              AI Advisor
            </p>

            <p className="text-white/80">
              Your profit margin is 18% this week. Consider restocking cooking
              oil and sugar.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <svg
        className="absolute bottom-0 left-0 w-full text-cream-50"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,32 C480,80 960,0 1440,32 L1440,60 L0,60 Z"
        />
      </svg>

      {/* Demo Modal */}
      {tourOpen && <DemoTourModal onClose={() => setTourOpen(false)} />}
    </section>
  );
}
