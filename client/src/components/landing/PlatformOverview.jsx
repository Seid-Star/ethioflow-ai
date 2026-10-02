import { CheckCircle2 } from "lucide-react";

const checks = [
  "Simple & powerful",
  "Easy to use",
  "Works offline",
  "Secure & reliable",
  "Made for Ethiopian businesses",
  "Built for growth",
];

export default function PlatformOverview() {
  return (
    <section className="bg-cream-50 pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
        <div className="text-left">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold-600">
            ALL IN ONE PLATFORM
          </p>
          <h2 className="mb-5 text-3xl font-bold leading-tight text-forest-950 sm:text-4xl">
            Everything you need to run and grow your business
          </h2>
          <p className="mb-8 max-w-md text-ink-900/70">
            From your first sale to your biggest goal — EthioFlow AI gives you
            the tools, insights and support to move your business forward.
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {checks.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="shrink-0 text-forest-700" />
                <span className="text-sm text-ink-900/80">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-2xl">
          <div className="mb-4 flex items-center gap-2 border-b border-black/5 pb-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <p className="mb-4 text-sm font-semibold text-forest-950">
            Good morning, Abebe 👋
          </p>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "Total Sales", value: "ETB 24,850" },
              { label: "Total Profit", value: "ETB 8,430" },
              { label: "Customers", value: "142" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg bg-forest-50 p-3">
                <p className="text-[10px] uppercase text-ink-900/50">
                  {kpi.label}
                </p>
                <p className="text-sm font-bold text-forest-900">{kpi.value}</p>
              </div>
            ))}
          </div>
          <div className="h-28 rounded-lg bg-gradient-to-t from-forest-100 to-transparent" />
        </div>
      </div>
    </section>
  );
}
