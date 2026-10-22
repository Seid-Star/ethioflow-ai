import { useEffect, useState } from "react";
import {
  CalendarDays,
  LogOut,
  WifiOff,
  Languages,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { useOnlineStatus } from "../../offline/useOnlineStatus";
import { setLanguage } from "../../i18n";
import NotificationBell from "./NotificationBell";

function getInitials(name) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isOnline = useOnlineStatus();
  const { t, i18n } = useTranslation();
  const [profilePicture, setProfilePicture] = useState("");

  const pictureStorageKey = `ethioflow-profile-picture-${user?._id || user?.id || user?.email || "current-user"}`;

  useEffect(() => {
    const loadPicture = () => {
      try {
        setProfilePicture(
          window.localStorage.getItem(pictureStorageKey) ||
            user?.profilePicture ||
            user?.avatar ||
            "",
        );
      } catch {
        setProfilePicture(user?.profilePicture || user?.avatar || "");
      }
    };

    loadPicture();
    window.addEventListener("storage", loadPicture);
    window.addEventListener("ethioflow-profile-picture-updated", loadPicture);
    return () => {
      window.removeEventListener("storage", loadPicture);
      window.removeEventListener(
        "ethioflow-profile-picture-updated",
        loadPicture,
      );
    };
  }, [pictureStorageKey, user?.profilePicture, user?.avatar]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl">
      <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-800 sm:flex">
            <CalendarDays size={19} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-700/65">
              EthioFlow AI
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-forest-950">
              {today}
            </p>
          </div>
          {!isOnline && (
            <span className="ml-1 inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 sm:ml-3 sm:px-3 sm:text-xs">
              <WifiOff size={13} className="shrink-0" />
              <span className="truncate">Offline · saving on this device</span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            <Languages
              size={15}
              className="ml-1.5 hidden text-slate-400 sm:block"
            />
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={i18n.language === "en"}
              className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${i18n.language === "en" ? "bg-forest-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-forest-900"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("am")}
              aria-pressed={i18n.language === "am"}
              className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${i18n.language === "am" ? "bg-forest-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-forest-900"}`}
            >
              አማ
            </button>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100">
            <NotificationBell />
          </div>

          <div className="mx-0.5 hidden h-9 w-px bg-slate-200 sm:block" />

          <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white py-1.5 pl-1.5 pr-2 sm:gap-3 sm:pl-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-forest-900 to-forest-700 text-sm font-bold text-white ring-2 ring-forest-50">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="hidden min-w-0 max-w-[150px] md:block">
              <p className="truncate text-sm font-bold text-forest-950">
                {user?.name || "Account user"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] capitalize text-slate-500">
                <UserRound size={11} />{" "}
                <span className="truncate">
                  {user?.role?.replace(/[_-]/g, " ") || "User"}
                </span>
              </p>
            </div>
            <ChevronDown size={14} className="hidden text-slate-400 md:block" />
          </div>

          <button
            type="button"
            onClick={logout}
            title={t("common.logout")}
            aria-label={t("common.logout")}
            className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:w-auto sm:gap-2 sm:px-3"
          >
            <LogOut
              size={16}
              className="transition group-hover:-translate-x-0.5"
            />
            <span className="hidden text-xs font-semibold sm:inline">
              {t("common.logout")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
