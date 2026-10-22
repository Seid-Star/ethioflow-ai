import {
  CheckCircle2,
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
    title: "Customer Credit",
    desc: "Build stronger relationships",
  },
  {
    icon: LineChart,
    title: "Monitor Finances",
    desc: "Understand profit and cash flow",
  },
  {
    icon: ShieldCheck,
    title: "Grow with AI",
    desc: "Make smarter decisions",
  },
];

const checks = [
  "Simple & powerful",
  "Easy to use",
  "Works offline",
  "Secure & reliable",
  "Made for Ethiopian businesses",
  "Built for growth",
];

const stats = [
  { label: "Total Sales", value: "ETB 24,850" },
  { label: "Total Profit", value: "ETB 8,430" },
  { label: "Customers", value: "142" },
];

const trustItems = [
  "Secure & reliable",
  "Designed for local businesses",
  "Tools for sustainable growth",
];

export default function PlatformOverview() {
  return (
    <section
      id="platform-overview"
      className="relative z-0 -mt-10 overflow-hidden bg-neutral-950 py-12 sm:-mt-14 sm:py-16 lg:-mt-14 lg:py-20"
    >
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=85')",
        }}
      />

      <div className="absolute inset-0 -z-10 bg-black/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/35 via-black/45 to-black/65" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-3 text-xs font-bold tracking-[0.22em] text-amber-300">
            EVERYTHING IN ONE PLACE
          </p>

          <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            One Platform.{" "}
            <span className="text-amber-300">Complete Control.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Everything you need to manage your daily operations, understand your
            business, and grow with confidence.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-12 lg:grid-cols-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col items-center rounded-2xl border border-white/20 bg-black/35 px-3 py-5 text-center backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-black/45 sm:px-4 sm:py-6"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-300/50 bg-amber-400/15 text-amber-300 shadow-lg transition duration-300 group-hover:bg-amber-400/25 sm:h-16 sm:w-16">
                <Icon size={28} strokeWidth={2.2} className="text-amber-300" />
              </div>

              <h3 className="text-sm font-bold text-white sm:text-base">
                {title}
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <div className="rounded-2xl border border-white/20 bg-black/40 p-6 text-white shadow-xl backdrop-blur-lg sm:p-8">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-amber-300">
              BUILT FOR YOUR BUSINESS
            </p>

            <h3 className="mb-4 text-2xl font-extrabold leading-tight sm:text-3xl">
              Run Your Business.{" "}
              <span className="text-amber-300">Grow Your Future.</span>
            </h3>

            <p className="mb-6 text-sm leading-relaxed text-white/80 sm:text-base">
              From your first sale to your biggest goal, EthioFlow AI brings
              your sales, inventory, customer credit, and financial insights
              together in one easy-to-use platform.
            </p>

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 border-t border-white/15 pt-6 sm:grid-cols-2">
              {checks.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2
                    size={18}
                    strokeWidth={2}
                    className="shrink-0 text-amber-300"
                  />
                  <span className="text-sm text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/25 bg-black/35 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <span className="text-xs font-medium text-white/70">
                ETHIOFLOW AI / DASHBOARD
              </span>
            </div>

            <h3 className="mb-5 text-base font-bold text-white sm:text-lg">
              Good morning, Abebe 👋
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-white/[0.08] p-3 sm:p-4"
                >
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/70">
                    {stat.label}
                  </p>

                  <p className="break-words text-base font-extrabold text-white sm:text-sm xl:text-lg">
                    {stat.value}
                  </p>

                  {index === 0 && (
                    <div className="mt-4 flex h-9 items-end gap-1">
                      {[30, 45, 35, 65, 50, 75, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-amber-300"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {index === 1 && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full border-[3px] border-amber-300 border-r-white/20" />
                      <span className="text-[10px] text-white/70">
                        Profit overview
                      </span>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="mt-4 flex items-center -space-x-2">
                      {["A", "B", "C", "D"].map((letter, i) => (
                        <div
                          key={letter}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-950 bg-amber-300 text-[10px] font-bold text-neutral-950"
                          style={{ opacity: 1 - i * 0.12 }}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/15 bg-black/25 p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white/90">
                  Business performance
                </span>

                <span className="text-xs text-amber-300">Sales overview</span>
              </div>

              <div className="flex h-20 items-end gap-1.5 sm:gap-2">
                {[28, 40, 34, 55, 45, 68, 58, 82, 72, 100, 86, 95].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600 to-amber-300"
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>

              <div className="mt-3 flex justify-between text-[10px] text-white/60">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/20 pt-6 sm:grid-cols-3 sm:gap-3">
          {trustItems.map((item) => (
            <div
              key={item}
              className="flex items-center justify-center gap-2 text-center text-xs text-white/80 sm:text-sm"
            >
              <CheckCircle2
                size={16}
                strokeWidth={2}
                className="shrink-0 text-amber-300"
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
