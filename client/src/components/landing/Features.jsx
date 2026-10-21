import CircularCarousel from "../CircularCarousel";
import "../CircularCarousel.css";
const items = [
  {
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85",
    alt: "Shop owner processing a business transaction",
    title: "AI-Powered Business Insights",
    subtitle:
      "Make confident decisions with insights from your real sales, expenses, and profits.",
  },
  {
    src: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=900&q=85",
    alt: "Customer making a payment at a shop",
    title: "Reliable Offline Sales",
    subtitle:
      "Keep your shop running and record transactions, even when connectivity is unavailable.",
  },
  {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85",
    alt: "Retail shop interior",
    title: "Smart Customer Credit",
    subtitle:
      "Manage customer balances, track repayments, and maintain clear credit records.",
  },
  {
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=85",
    alt: "Organized products in storage",
    title: "Intelligent Inventory Control",
    subtitle:
      "Monitor stock levels, identify products running low, and plan timely restocking.",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
    alt: "Business financial analytics",
    title: "Complete Financial Visibility",
    subtitle:
      "Understand revenue, expenses, and net profit with your business data in one place.",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
    alt: "Business reports and analytics dashboard",
    title: "Actionable Business Reports",
    subtitle:
      "Turn daily transactions into organized reports that help you evaluate performance.",
  },
];

export default function Features() {
  return (
    <section id="features" className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold-600">
            FEATURES
          </p>

          <h2 className="mb-4 text-3xl font-bold text-forest-950 sm:text-4xl">
            Everything a growing shop actually needs
          </h2>

          <p className="leading-relaxed text-ink-900/60">
            Not a generic POS with AI bolted on — built around how Ethiopian
            merchants actually run their business.
          </p>
        </div>

        <div className="relative mx-auto w-full" style={{ height: "560px" }}>
          <CircularCarousel
            items={items}
            preset="cylinder"
            intro="rise"
            cardWidth={220}
            aspectRatio={1}
            speed={14}
            captions
          />
        </div>

        <p className="mt-2 text-center text-sm text-ink-900/50">
          Explore the features — drag to rotate and select a card to focus.
        </p>
      </div>
    </section>
  );
}
