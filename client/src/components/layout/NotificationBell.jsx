import { useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, Wallet, TrendingUp, X } from "lucide-react";
import { api } from "../../api/axios";

const typeIcons = {
  low_stock: { icon: AlertTriangle, color: "text-red-500" },
  overdue_credit: { icon: Wallet, color: "text-amber-500" },
  sales_milestone: { icon: TrendingUp, color: "text-emerald-500" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  async function load() {
    const { data } = await api.get("/notifications");
    setNotifications(data);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleOpen() {
    setOpen((v) => !v);
    if (unreadCount > 0) {
      await api.post("/notifications/read-all");
      setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
    }
  }

  return (
    <div ref={ref}>
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 hover:bg-black/5"
      >
        <Bell size={18} className="text-ink-900/70" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile: full-screen backdrop + bottom sheet */}
          <div
            className="fixed inset-0 z-50 sm:hidden"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl bg-white p-3 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                  Notifications
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 hover:bg-black/5"
                >
                  <X size={16} />
                </button>
              </div>
              <NotificationList notifications={notifications} />
            </div>
          </div>

          {/* Desktop/tablet: normal dropdown */}
          <div className="absolute right-4 top-14 z-50 hidden w-80 max-w-[90vw] rounded-2xl border border-black/5 bg-white p-2 shadow-xl sm:block">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
              Notifications
            </p>
            <NotificationList notifications={notifications} />
          </div>
        </>
      )}
    </div>
  );
}

function NotificationList({ notifications }) {
  if (notifications.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-ink-900/40">
        Nothing new
      </p>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {notifications.map((n) => {
        const { icon: Icon, color } = typeIcons[n.type] || typeIcons.low_stock;
        return (
          <div
            key={n._id}
            className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 hover:bg-forest-50/60"
          >
            <Icon size={15} className={`mt-0.5 shrink-0 ${color}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-forest-950">{n.title}</p>
              <p className="text-xs text-ink-900/60">{n.message}</p>
              <p className="mt-0.5 text-[10px] text-ink-900/35">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
