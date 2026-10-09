import { NavLink } from "react-router-dom";
import { UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Truck,
  ClipboardList,
  Wallet,
  LineChart,
  FileText,
  Sparkles,
  Settings,
  Receipt,
} from "lucide-react";

const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
    end: true,
    enabled: true,
  },
  { to: "/dashboard/pos", icon: ShoppingCart, key: "pos", enabled: true },
  { to: "/dashboard/sales", icon: Receipt, key: "sales", enabled: true },
  { to: "/dashboard/products", icon: Package, key: "products", enabled: true },
  { to: "/dashboard/inventory", icon: Boxes, key: "inventory", enabled: true },
  { to: "/dashboard/customers", icon: Users, key: "customers", enabled: true },
  {
    to: "/dashboard/employees",
    icon: UsersRound,
    key: "employees",
    enabled: true,
  },
  { to: "/dashboard/suppliers", icon: Truck, key: "suppliers", enabled: true },
  {
    to: "/dashboard/purchases",
    icon: ClipboardList,
    key: "purchases",
    enabled: true,
  },
  { to: "/dashboard/expenses", icon: Wallet, key: "expenses", enabled: true },
  { to: "/dashboard/finance", icon: LineChart, key: "finance", enabled: true },
  { to: "/dashboard/reports", icon: FileText, key: "reports", enabled: true },
  { to: "/dashboard/ai", icon: Sparkles, key: "ai", enabled: true },
  {
    to: "/dashboard/settings",
    icon: Settings,
    key: "settings",
    enabled: true,
  },
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-forest-950 text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-forest-700">
          <span className="text-lg font-bold text-white">
            <img src="\public\logo.jpg"></img>
          </span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">
            EthioFlow <span className="text-gold-500">AI</span>
          </p>
          <p className="text-[10px] text-white/50">ብልህ ንግድ</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map(({ to, icon: Icon, key, end, enabled }) =>
          enabled ? (
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
              <Icon size={17} /> {t(`nav.${key}`)}
            </NavLink>
          ) : (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/30"
            >
              <span className="flex items-center gap-3">
                <Icon size={17} /> {t(`nav.${key}`)}
              </span>
              <span className="text-[9px] uppercase tracking-wide">Soon</span>
            </div>
          ),
        )}
      </nav>
    </aside>
  );
}
