export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        <p className="mb-3 text-xs font-semibold tracking-wide text-gold-600">
          ABOUT
        </p>
        <h2 className="mb-6 text-3xl font-bold text-forest-950 sm:text-4xl">
          Built for how Ethiopian shops actually work
        </h2>
        <p className="mb-6 leading-relaxed text-ink-900/70">
          Most small business tools are built somewhere else and translated
          later. EthioFlow AI starts from the opposite direction: unreliable
          internet, customer credit culture, mobile and cash payments, and the
          everyday reality of running a shop with a notebook and a calculator.
          Every feature — from offline-first sales to the AI Advisor — exists
          because a real shop needed it, not because a feature checklist said
          so.
        </p>
        <p className="leading-relaxed text-ink-900/70">
          Our goal isn't AI for decoration. It's turning the transactions
          already happening at your counter into the financial record that can
          one day help you access credit, insurance, and growth.
        </p>
      </div>
    </section>
  );
}
