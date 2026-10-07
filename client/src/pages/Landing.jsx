import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import FeatureStrip from "../components/landing/FeatureStrip";
import PlatformOverview from "../components/landing/PlatformOverview";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import About from "../components/landing/About";
import Contact from "../components/landing/Contact";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureStrip />
      <PlatformOverview />
      <Features />
      <Pricing />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
