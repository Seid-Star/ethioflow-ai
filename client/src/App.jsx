import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import Employees from "./pages/Employees";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import AIAdvisor from "./pages/AIAdvisor";
import Subscription from "./pages/Subscription";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import PlanGate from "./components/PlanGate";
import SubscriptionReturn from "./pages/SubscriptionReturn";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="pos" element={<POS />} />
          <Route path="sales" element={<Sales />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerProfile />} />
          <Route path="employees" element={<Employees />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="subscription/return" element={<SubscriptionReturn />} />
          <Route
            path="ai"
            element={
              <PlanGate
                minPlan="professional"
                feature="The AI Business Advisor"
              >
                <AIAdvisor />
              </PlanGate>
            }
          />
          <Route path="subscription" element={<Subscription />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
