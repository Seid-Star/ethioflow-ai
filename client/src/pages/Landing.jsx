import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import FeatureStrip from "../components/landing/FeatureStrip";
import PlatformOverview from "../components/landing/PlatformOverview";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureStrip />
      <PlatformOverview />
    </div>
  );
}
