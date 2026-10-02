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
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 pb-24 pt-32 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-10">
        {/* Left: copy */}
        <div className="flex flex-col justify-center text-left">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold-500">
            SMART BUSINESS — AI FOR ETHIOPIA'S MERCHANTS
          </p>

          <h1 className="mb-2 text-5xl leading-tight">ብልህ ንግድ</h1>

          <h2 className="mb-6 text-4xl font-bold leading-tight">
            EthioFlow <span className="text-gold-500">AI</span>
          </h2>

          <p className="mb-8 max-w-md text-white/80">
            An offline-first, AI-powered financial and business management
            platform that helps Ethiopian micro and small businesses manage
            sales, inventory, customer credit and expenses — and turns everyday
            transactions into actionable financial intelligence.
          </p>

          <div className="mb-9 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
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

          <div className="flex items-center gap-6">
            <a
              href="/register"
              className="flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-600"
            >
              Start Your Free Trial
              <ArrowRight size={16} />
            </a>

            <button className="flex items-center gap-3 text-sm text-white/85">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40">
                <Play size={14} className="ml-0.5" />
              </span>

              <span className="text-left leading-tight">
                Watch Demo
                <br />
                <span className="text-white/60">2 min</span>
              </span>
            </button>
          </div>
        </div>

        {/* Right: product visual */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <img
              src="/image.png"
              alt="EthioFlow shop and POS"
              className="block h-80 w-full object-cover transition-transform duration-700 hover:scale-[1.02] sm:h-96"
            />
          </div>

          {/* POS menu */}
          <div className="absolute -left-6 top-6 hidden w-40 rounded-2xl bg-forest-900/95 p-2 shadow-xl ring-1 ring-white/10 sm:block">
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

          {/* AI Advisor */}
          <div className="absolute -right-4 -top-8 hidden max-w-[220px] rounded-2xl bg-forest-700/95 p-4 text-xs shadow-xl ring-1 ring-white/10 sm:block">
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
    </section>
  );
}
