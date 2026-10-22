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
    title: "Manage Sales",
    desc: "Track every sale, every channel",
  },
  {
    icon: PackageSearch,
    title: "Control Inventory",
    desc: "Never run out, never overstock",
  },
  {
    icon: Handshake,
    title: "Track Customer Credit",
    desc: "Build stronger customer relationships",
  },
  {
    icon: LineChart,
    title: "Monitor Finances",
    desc: "Know your profit, cash flow & growth",
  },
  {
    icon: ShieldCheck,
    title: "Grow with AI",
    desc: "Smart insights for better decisions",
  },
];

export default function FeatureStrip() {
  return (
    <section className="relative isolate overflow-hidden py-10 sm:py-12">
      {/* Remote background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=85')",
        }}
      />

      {/* Dark glass overlay */}
      <div className="absolute inset-0 -z-10 bg-forest-950/75 backdrop-blur-[3px]" />

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-8 px-5 sm:grid-cols-3 sm:gap-7 lg:grid-cols-5 lg:px-10">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group flex flex-col items-center text-center text-white"
          >
            {/* Icon */}
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-400/40 bg-white/10 text-gold-300 shadow-lg backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:bg-white/20 sm:h-16 sm:w-16">
              <Icon size={27} strokeWidth={1.7} />
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold sm:text-base">{title}</h3>

            {/* Description */}
            <p className="mt-1 max-w-[190px] text-xs leading-relaxed text-white/75 sm:text-sm">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
