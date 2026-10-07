import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SyncManager from "./SyncManager";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cream-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar: always mounted, animated via transform/opacity */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute left-0 top-0 h-full transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-4 rounded-full bg-white/10 p-2 text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 hover:bg-black/5"
          >
            <Menu size={20} />
          </button>
          <p className="text-sm font-bold text-forest-950">
            EthioFlow <span className="text-gold-500">AI</span>
          </p>
        </div>

        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <SyncManager />
    </div>
  );
}
