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
  ShieldCheck,
  TrendingUp,
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
    <section className="relative isolate overflow-hidden bg-forest-950 pt-10 pb-24 text-white sm:pt-14 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-gold-500/[0.08] blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900/40 via-transparent to-black/20" />
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-10">
        <div className="flex flex-col items-start text-left">
          <div
            className="mt-6 mb-7 inline-flex animate-fade-up items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/[0.08] px-4 py-2 sm:mt-8"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300 sm:text-xs">
              {t("landing.eyebrow")}
            </span>
          </div>

          <h1
            className="animate-fade-up max-w-xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            <span className="block text-white">ብልህ ንግድ</span>
            <span className="mt-2 block">
              EthioFlow{" "}
              <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-amber-400 bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </h1>

          <div
            className="animate-fade-up mt-6 mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
            style={{ animationDelay: "120ms" }}
          />

          <p
            className="animate-fade-up max-w-lg text-base leading-8 text-white/70 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {t("landing.subtitle")}
          </p>

          <div
            className="animate-fade-up mt-8 mb-9 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4"
            style={{ animationDelay: "220ms" }}
          >
            {pillars.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="group flex min-h-[100px] flex-col items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 transition duration-300 hover:-translate-y-1 hover:border-gold-400/30 hover:bg-white/[0.07] sm:p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-400/15 bg-gold-400/10 transition group-hover:bg-gold-400/20">
                  <Icon size={19} className="text-gold-400" />
                </div>
                <p className="whitespace-pre-line text-xs font-medium leading-5 text-white/80 sm:text-[13px]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="animate-fade-up flex w-full flex-col items-start gap-5 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: "280ms" }}
          >
            <a
              href="/register"
              className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-amber-300 bg-amber-400 px-7 py-4 text-sm font-bold text-forest-950 shadow-lg shadow-amber-400/25 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30 sm:w-auto"
            >
              {t("landing.startTrial")}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>

            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="group inline-flex items-center gap-3 rounded-xl py-2 text-left transition hover:text-gold-300"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] transition group-hover:border-gold-400/60 group-hover:bg-gold-400/10">
                <Play size={16} className="ml-0.5 text-gold-300" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">
                  {t("landing.watchDemo")}
                </span>
                <span className="mt-1 block text-xs text-white/45">
                  {t("landing.demoLength")}
                </span>
              </span>
            </button>
          </div>

          <div
            className="animate-fade-up mt-8 flex items-center gap-2 text-xs text-white/45"
            style={{ animationDelay: "340ms" }}
          >
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Built for the realities of Ethiopian businesses</span>
          </div>
        </div>

        <div className="relative mx-auto mt-10 w-full max-w-xl self-start sm:mt-12 lg:ml-auto lg:mt-16">
          <div className="pointer-events-none absolute -inset-6 rounded-[40px] bg-emerald-400/[0.06] blur-3xl" />

          <div className="relative rounded-[28px] border border-white/15 bg-white/[0.06] p-2.5 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-3">
            <div className="relative overflow-hidden rounded-[21px] bg-forest-900">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-forest-950/35 via-transparent to-forest-950/10" />

              <img
                src="/image.png"
                alt="EthioFlow AI business management platform"
                className="block aspect-[4/3] w-full object-cover object-center transition duration-700 ease-out hover:scale-[1.025] sm:aspect-[5/4]"
              />

              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-forest-950/80 px-3 py-2 backdrop-blur-md sm:bottom-5 sm:left-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400/15">
                  <Sparkles size={14} className="text-gold-400" />
                </span>
                <span className="text-xs font-medium text-white">
                  Powered by EthioFlow AI
                </span>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -left-3 top-8 z-20 hidden w-40 rounded-2xl border border-white/10 bg-forest-900/95 p-2.5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:block md:-left-9 md:w-44">
            <div className="mb-2 flex items-center justify-between px-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Workspace
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            {posMenu.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition ${
                  i === 0
                    ? "border border-gold-400/15 bg-gold-400/10 font-semibold text-gold-300"
                    : "text-white/60"
                }`}
              >
                <Icon size={14} />
                {label}
              </div>
            ))}
            <div className="mt-2 border-t border-white/[0.08] px-3 pt-3 pb-1 text-[10px] text-white/40">
              One platform. Your business.
            </div>
          </div>

          <div
            className="animate-float absolute -right-2 -top-7 z-20 hidden w-56 rounded-2xl border border-white/10 bg-forest-900/95 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:block md:-right-5"
            style={{ animationDelay: "1.2s" }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/15">
                <Sparkles size={17} className="text-gold-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">AI Advisor</p>
                <p className="mt-0.5 text-[10px] text-white/45">
                  Business insights
                </p>
              </div>
              <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs leading-5 text-white/70">
              Your profit margin is 18% this week. Consider restocking cooking
              oil and sugar.
            </p>
            <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.08] pt-3 text-[10px] font-medium text-emerald-300">
              <TrendingUp size={12} />
              AI-powered recommendations
            </div>
          </div>

          <div
            className="animate-float absolute -bottom-7 right-3 z-20 hidden items-center gap-3 rounded-2xl border border-white/10 bg-forest-900/95 px-4 py-3 shadow-2xl shadow-black/25 backdrop-blur-xl sm:flex md:-right-3"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
              <ShoppingCart size={18} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Sales & inventory
              </p>
              <p className="mt-1 text-[10px] text-white/45">
                Manage your shop in one place
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-10 -left-4 -z-10 h-36 w-36 rounded-full bg-gold-400/[0.07] blur-3xl" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full text-cream-50">
        <svg
          className="block h-10 w-full sm:h-14"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,32 C480,80 960,0 1440,32 L1440,60 L0,60 Z"
          />
        </svg>
      </div>

      {tourOpen && <DemoTourModal onClose={() => setTourOpen(false)} />}
    </section>
  );
}
