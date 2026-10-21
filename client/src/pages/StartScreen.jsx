import { useNavigate } from "react-router-dom";
import Ribbons from "../components/Ribbons";
import "./StartScreen.css";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <main className="start-screen">
      <div className="start-ribbons">
        <Ribbons
          colors={["#3847ff", "#7c84ff", "#c7cbff"]}
          thickness={30}
          length={1.4}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className="start-overlay" />

      <section className="start-content">
        <div className="start-logo">
          <img
            src="/logo1.png"
            alt="EthioFlow AI logo"
            className="start-logo-icon"
          />
          <span>EthioFlow AI</span>
        </div>

        <p className="start-eyebrow">YOUR BUSINESS. YOUR FUTURE.</p>

        <h1>
          Grow smarter.
          <br />
          <span>Flow better.</span>
        </h1>

        <p className="start-description">
          Your all-in-one business companion. Manage sales, track inventory, and
          make smarter decisions with AI.
        </p>

        <button className="start-button" onClick={() => navigate("/home")}>
          Get Started <span>→</span>
        </button>

        <p className="start-note">Built for Ethiopian businesses 🇪🇹</p>
      </section>
    </main>
  );
}
