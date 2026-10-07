import {
  Sparkles,
  Boxes,
  Users,
  Wallet,
  LineChart,
  WifiOff,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Business Advisor",
    desc: 'Ask plain-language questions like "Why did my profit decrease?" and get a clear answer with real numbers, not a dashboard full of charts to decode yourself.',
  },
  {
    icon: WifiOff,
    title: "Offline-First POS",
    desc: "Keep selling even when the internet drops. Every sale is saved on the device and syncs automatically the moment you're back online.",
  },
  {
    icon: Users,
    title: "Customer Credit Ledger",
    desc: "Track exactly who owes you what, with the same rigor as a bank ledger — purchases, payments, and running balances, all in one timeline.",
  },
  {
    icon: Boxes,
    title: "Smart Inventory",
    desc: 'Get restock alerts before you run out, based on your actual sales velocity — not just a static "low stock" flag.',
  },
  {
    icon: Wallet,
    title: "Full Financial Picture",
    desc: "Revenue, cost of goods sold, gross and net profit, and real cash flow — calculated correctly, not guessed.",
  },
  {
    icon: LineChart,
    title: "Reports That Export",
    desc: "Sales, inventory, financial, customer, and supplier reports, ready to download whenever you need them.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold-600">
            FEATURES
          </p>
          <h2 className="mb-4 text-3xl font-bold text-forest-950 sm:text-4xl">
            Everything a growing shop actually needs
          </h2>
          <p className="text-ink-900/60">
            Not a generic POS with AI bolted on — built around how Ethiopian
            merchants actually run their business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-black/5 p-6 transition hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <Icon size={20} />
              </div>
              <h3 className="mb-2 font-semibold text-forest-950">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-900/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
