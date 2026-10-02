import {
  LayoutGrid,
  PackageSearch,
  Handshake,
  LineChart,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    tint: "bg-emerald-50 text-emerald-700",
    title: "Manage Sales",
    desc: "Track every sale, every channel",
  },
  {
    icon: PackageSearch,
    tint: "bg-amber-50 text-amber-700",
    title: "Control Inventory",
    desc: "Never run out, never overstock",
  },
  {
    icon: Handshake,
    tint: "bg-violet-50 text-violet-700",
    title: "Track Customer Credit",
    desc: "Build stronger customer relationships",
  },
  {
    icon: LineChart,
    tint: "bg-teal-50 text-teal-700",
    title: "Monitor Finances",
    desc: "Know your profit, cash flow & growth",
  },
  {
    icon: ShieldCheck,
    tint: "bg-sky-50 text-sky-700",
    title: "Grow with AI",
    desc: "Smart insights for better decisions",
  },
];

export default function FeatureStrip() {
  return (
    <section className="bg-cream-50 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-5 lg:px-10">
        {features.map(({ icon: Icon, tint, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-forest-950">{title}</p>
              <p className="text-sm text-ink-900/60">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
