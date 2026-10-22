import { Link } from "react-router-dom";

export default function AuthShell({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-yellow-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-600/10 blur-[140px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-1/3 h-40 w-[150%] rotate-[-18deg] border-y border-amber-400/10 shadow-[0_0_35px_rgba(234,179,8,0.08)]" />
        <div className="absolute -right-1/4 top-1/2 h-24 w-[150%] rotate-[-18deg] border-y border-yellow-500/10" />
        <div className="absolute -left-1/4 bottom-1/4 h-32 w-[150%] rotate-[18deg] border-y border-white/[0.06]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          aria-label="EthioFlow AI home"
          className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-xl transition duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        >
          <img
            src="/logo1.png"
            alt="EthioFlow AI logo"
            className="h-12 w-12 rounded-full object-contain"
          />

          <p className="text-xl font-bold tracking-tight text-white">
            EthioFlow <span className="text-yellow-400">AI</span>
          </p>
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-9">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
          {children}
        </section>

        <p className="mt-6 text-center text-xs tracking-wide text-white/35">
          EthioFlow AI · Smart business, simplified.
        </p>
      </div>
    </main>
  );
}
