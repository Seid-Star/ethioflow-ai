import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

const links = ["Home", "Features", "Pricing", "About", "Contact"];

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold-500 to-forest-700">
            <img
              src="/logo.jpg"
              alt="EthioFlow"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-left leading-tight">
            <p className="text-lg font-bold text-white">
              EthioFlow <span className="text-gold-500">AI</span>
            </p>
            <p className="text-xs text-white/70">ብልህ ንግድ</p>
          </div>
        </div>

        <ul className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
          {links.map((l, i) => (
            <li key={l}>
              <a
                href={i === 0 ? "/" : `#${l.toLowerCase()}`}
                className={
                  i === 0 ? "text-gold-500" : "transition hover:text-white"
                }
              >
                {l}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-1 text-sm text-white/80 sm:flex">
            <Globe size={16} /> EN
          </button>
          <Link
            to="/login"
            className="hidden rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:block"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 transition hover:bg-gold-600"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
