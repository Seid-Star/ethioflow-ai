import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SyncManager from "./SyncManager";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-cream-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <SyncManager />
    </div>
  );
}
