import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { setLanguage } from "../../i18n";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const ref = useRef(null);

  const links = [
    { key: "home", href: "/home" },
    { key: "platform", href: "#platform-overview" },
    { key: "features", href: "#features" },
    { key: "pricing", href: "#pricing" },
    { key: "about", href: "#about" },
    { key: "contact", href: "#contact" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-0 sm:px-5 sm:pt-0">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/30 bg-forest-950/55 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur-2xl transition-all duration-300 sm:px-7 lg:px-10">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="EthioFlow AI Home"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold-500 to-forest-700">
            <img
              src="/logo.jpg"
              alt="EthioFlow AI logo"
              className="h-full w-full object-cover"
              link="/"
            />
          </div>

          <div className="text-left leading-tight">
            <p className="text-lg font-bold text-white">
              EthioFlow <span className="text-gold-500">AI</span>
            </p>
            <p className="text-xs text-white/70">ብልህ ንግድ</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium text-white md:flex">
          {links.map((l, i) => (
            <li key={l.key}>
              {l.key === "home" ? (
                <Link
                  to={l.href}
                  className="text-gold-500 transition hover:text-gold-400"
                >
                  {t(`landing.nav.${l.key}`)}
                </Link>
              ) : (
                <a href={l.href} className="transition hover:text-white">
                  {t(`landing.nav.${l.key}`)}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block" ref={ref}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
              aria-label="Select language"
              className="flex items-center gap-1 rounded-full px-2 py-1.5 text-sm text-white drop-shadow-sm hover:bg-white/15 hover:bg-white/10"
            >
              <Globe size={16} />
              {i18n.language === "am" ? "አማ" : "EN"}
              <ChevronDown
                size={12}
                className={`transition-transform ${
                  langOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-10 w-32 overflow-hidden rounded-xl bg-white shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("en");
                    setLangOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm ${
                    i18n.language === "en"
                      ? "bg-forest-50 font-medium text-forest-900"
                      : "text-ink-900/70 hover:bg-forest-50"
                  }`}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLanguage("am");
                    setLangOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm ${
                    i18n.language === "am"
                      ? "bg-forest-50 font-medium text-forest-900"
                      : "text-ink-900/70 hover:bg-forest-50"
                  }`}
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>

          <Link
            to="/login"
            className="hidden rounded-full border border-white/30 px-5 py-2 text-sm font-medium border border-white/40 bg-black/10 text-white backdrop-blur-md transition hover:bg-white/15transition hover:bg-white/10 sm:block"
          >
            {t("landing.login")}
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 transition hover:bg-gold-600"
          >
            {t("landing.getStarted")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
