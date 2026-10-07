import { LogOut, WifiOff, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { useOnlineStatus } from "../../offline/useOnlineStatus";
import { setLanguage } from "../../i18n";
import NotificationBell from "./NotificationBell";
export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isOnline = useOnlineStatus();
  const { t, i18n } = useTranslation();

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-black/5 bg-white px-4 py-2 sm:px-6">
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-ink-900/60 sm:block">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        {!isOnline && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            <WifiOff size={12} /> Offline — sales are being saved on this device
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-1 rounded-full border border-black/10 p-1">
          <button
            onClick={() => setLanguage("en")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              i18n.language === "en"
                ? "bg-forest-900 text-white"
                : "text-ink-900/50"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("am")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              i18n.language === "am"
                ? "bg-forest-900 text-white"
                : "text-ink-900/50"
            }`}
          >
            አማ
          </button>
        </div>

        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-forest-950">{user?.name}</p>
          <p className="text-xs capitalize text-ink-900/50">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink-900/70 hover:bg-black/5"
        >
          <LogOut size={14} /> {t("common.logout")}
        </button>
      </div>
    </header>
  );
}
