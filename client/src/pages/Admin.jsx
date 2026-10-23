import { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Inbox,
  Lock,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useAdminUnread } from "../lib/useAdminUnread";
import OverviewTab from "../components/admin/OverviewTab";
import BusinessesTab from "../components/admin/BusinessesTab";
import MessagesTab from "../components/admin/MessagesTab";

export default function Admin() {
  const isAdmin = useAuthStore((s) => Boolean(s.user?.isPlatformAdmin));
  const [tab, setTab] = useState("overview");
  const unread = useAdminUnread(isAdmin);

  if (!isAdmin) {
    return (
      <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-black/5 bg-white p-8 text-center">
        <Lock size={28} className="mx-auto mb-3 text-ink-900/30" />
        <p className="font-semibold text-forest-950">
          Platform administrators only
        </p>
        <p className="mt-1 text-sm text-ink-900/55">
          If you were just made an administrator, log out and log back in.
        </p>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "businesses", label: "Businesses", icon: Building2 },
    { key: "messages", label: "Messages", icon: Inbox, badge: unread },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-forest-950">
          <ShieldCheck className="text-gold-500" /> Platform Admin
        </h1>
        <p className="text-sm text-ink-900/60">
          Everything across EthioFlow AI: businesses, subscriptions, and
          messages from the website.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
              tab === key
                ? "bg-forest-900 text-white"
                : "border border-black/10 text-ink-900/60 hover:bg-black/5"
            }`}
          >
            <Icon size={14} /> {label}
            {badge > 0 && (
              <span className="ml-0.5 rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-forest-950">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "businesses" && <BusinessesTab />}
      {tab === "messages" && <MessagesTab />}
    </div>
  );
}
