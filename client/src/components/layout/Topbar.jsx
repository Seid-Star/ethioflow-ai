import { LogOut, WifiOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useOnlineStatus } from "../../offline/useOnlineStatus";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isOnline = useOnlineStatus();

  return (
    <header className="flex h-16 items-center justify-between border-b border-black/5 bg-white px-6">
      <div className="flex items-center gap-3">
        <p className="text-sm text-ink-900/60">
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
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-forest-950">{user?.name}</p>
          <p className="text-xs capitalize text-ink-900/50">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink-900/70 hover:bg-black/5"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </header>
  );
}
