import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  Users,
  UsersRound,
  Truck,
  ClipboardList,
  Wallet,
  LineChart,
  FileText,
  Sparkles,
  CreditCard,
  ScrollText,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAdminUnread } from "../../lib/useAdminUnread";
import PlanBadge from "./PlanBadge";

const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
    label: "Dashboard",
    end: true,
  },
  {
    to: "/dashboard/pos",
    icon: ShoppingCart,
    key: "pos",
    label: "Sales (POS)",
  },
  {
    to: "/dashboard/sales",
    icon: Receipt,
    key: "sales",
    label: "Sales History",
  },
  {
    to: "/dashboard/products",
    icon: Package,
    key: "products",
    label: "Products",
  },
  {
    to: "/dashboard/inventory",
    icon: Boxes,
    key: "inventory",
    label: "Inventory",
  },
  {
    to: "/dashboard/customers",
    icon: Users,
    key: "customers",
    label: "Customers",
  },
  {
    to: "/dashboard/employees",
    icon: UsersRound,
    key: "employees",
    label: "Employees",
  },
  {
    to: "/dashboard/suppliers",
    icon: Truck,
    key: "suppliers",
    label: "Suppliers",
  },
  {
    to: "/dashboard/purchases",
    icon: ClipboardList,
    key: "purchases",
    label: "Purchases",
  },
  {
    to: "/dashboard/expenses",
    icon: Wallet,
    key: "expenses",
    label: "Expenses",
  },
  {
    to: "/dashboard/finance",
    icon: LineChart,
    key: "finance",
    label: "Finance",
  },
  {
    to: "/dashboard/reports",
    icon: FileText,
    key: "reports",
    label: "Reports",
  },
  { to: "/dashboard/ai", icon: Sparkles, key: "ai", label: "AI Advisor" },
  {
    to: "/dashboard/subscription",
    icon: CreditCard,
    key: "subscription",
    label: "Subscription",
  },
  {
    to: "/dashboard/audit",
    icon: ScrollText,
    key: "audit",
    label: "Audit Log",
    roles: ["owner", "manager"],
  },
  {
    to: "/dashboard/settings",
    icon: Settings,
    key: "settings",
    label: "Settings",
  },
  {
    to: "/dashboard/admin",
    icon: ShieldCheck,
    key: "admin",
    label: "Platform Admin",
    admin: true,
  },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = useAuthStore((s) => Boolean(s.user?.isPlatformAdmin));
  const unread = useAdminUnread(isAdmin);

  const visible = navItems.filter((item) => {
    if (item.admin) return isAdmin;
    return !item.roles || item.roles.includes(role);
  });

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-forest-950 text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-forest-700">
          <img src="/logo1.png"></img>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">
            EthioFlow <span className="text-gold-500">AI</span>
          </p>
          <p className="text-[10px] text-white/50">ብልህ ንግድ</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {visible.map(({ to, icon: Icon, key, label, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-forest-700 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            <span className="flex-1">
              {t(`nav.${key}`, { defaultValue: label })}
            </span>
            {key === "admin" && unread > 0 && (
              <span className="rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-forest-950">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <PlanBadge />
    </aside>
  );
}
