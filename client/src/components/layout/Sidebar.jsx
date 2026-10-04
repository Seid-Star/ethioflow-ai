import { NavLink } from "react-router-dom";
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
} from "lucide-react";

const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    end: true,
    enabled: true,
  },
  {
    to: "/dashboard/pos",
    icon: ShoppingCart,
    label: "Sales (POS)",
    enabled: true,
  },
  {
    to: "/dashboard/products",
    icon: Package,
    label: "Products",
    enabled: true,
  },
  {
    to: "/dashboard/inventory",
    icon: Boxes,
    label: "Inventory",
    enabled: true,
  },
  {
    to: "/dashboard/customers",
    icon: Users,
    label: "Customers",
    enabled: true,
  },
  {
    to: "/dashboard/suppliers",
    icon: Truck,
    label: "Suppliers",
    enabled: true,
  },
  {
    to: "/dashboard/purchases",
    icon: ClipboardList,
    label: "Purchases",
    enabled: true,
  },
  {
    to: "/dashboard/expenses",
    icon: Wallet,
    label: "Expenses",
    enabled: true,
  },
  {
    to: "/dashboard/finance",
    icon: LineChart,
    label: "Finance",
    enabled: false,
  },
  {
    to: "/dashboard/reports",
    icon: FileText,
    label: "Reports",
    enabled: true,
  },
  { to: "/dashboard/ai", icon: Sparkles, label: "AI Advisor", enabled: true },
  {
    to: "/dashboard/settings",
    icon: Settings,
    label: "Settings",
    enabled: true,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-forest-950 text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold-500 to-forest-700">
          <img
            src="/logo.jpg"
            alt="EthioFlow"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">
            EthioFlow <span className="text-gold-500">AI</span>
          </p>
          <p className="text-[10px] text-white/50">ብልህ ንግድ</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map(({ to, icon: Icon, label, end, enabled }) =>
          enabled ? (
            <NavLink
              key={label}
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
              <Icon size={17} /> {label}
            </NavLink>
          ) : (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/30"
              title="Coming soon"
            >
              <span className="flex items-center gap-3">
                <Icon size={17} /> {label}
              </span>
              <span className="text-[9px] uppercase tracking-wide">Soon</span>
            </div>
          ),
        )}
      </nav>
    </aside>
  );
}
