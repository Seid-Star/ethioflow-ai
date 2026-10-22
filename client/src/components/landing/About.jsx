// export default function About() {
//   return (
//     <section id="about" className="bg-white py-24">
//       <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
//         <p className="mb-3 text-xs font-semibold tracking-wide text-gold-600">
//           ABOUT
//         </p>
//         <h2 className="mb-6 text-3xl font-bold text-forest-950 sm:text-4xl">
//           Built for how Ethiopian shops actually work
//         </h2>
//         <p className="mb-6 leading-relaxed text-ink-900/70">
//           Most small business tools are built somewhere else and translated
//           later. EthioFlow AI starts from the opposite direction: unreliable
//           internet, customer credit culture, mobile and cash payments, and the
//           everyday reality of running a shop with a notebook and a calculator.
//           Every feature — from offline-first sales to the AI Advisor — exists
//           because a real shop needed it, not because a feature checklist said
//           so.
//         </p>
//         <p className="leading-relaxed text-ink-900/70">
//           Our goal isn't AI for decoration. It's turning the transactions
//           already happening at your counter into the financial record that can
//           one day help you access credit, insurance, and growth.
//         </p>
//       </div>
//     </section>
//   );
// }

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-yellow-500" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">
              About EthioFlow
            </p>
            <span className="h-px w-8 bg-yellow-500" />
          </div>

          <h2 className="mb-7 text-3xl font-extrabold leading-tight tracking-tight text-forest-950 sm:text-4xl lg:text-5xl">
            Built for how Ethiopian shops{" "}
            <span className="relative inline-block">
              actually work
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-yellow-400/70" />
            </span>
          </h2>

          <p className="mx-auto mb-6 max-w-2xl text-base leading-8 text-ink-900/70 sm:text-lg">
            Most small business tools are built somewhere else and translated
            later. EthioFlow AI starts from the opposite direction: unreliable
            internet, customer credit culture, mobile and cash payments, and the
            everyday reality of running a shop with a notebook and a calculator.
            Every feature — from offline-first sales to the AI Advisor — exists
            because a real shop needed it, not because a feature checklist said
            so.
          </p>

          <p className="mx-auto max-w-2xl border-l-2 border-yellow-500/70 pl-5 text-left text-base leading-8 text-ink-900/70 sm:text-lg">
            Our goal isn't AI for decoration. It's turning the transactions
            already happening at your counter into the financial record that can
            one day help you access credit, insurance, and growth.
          </p>

          <div className="mx-auto mt-10 h-1 w-16 rounded-full bg-gradient-to-r from-yellow-300 to-amber-600" />
        </div>
      </div>
    </section>
  );
}
