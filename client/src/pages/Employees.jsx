import { useEffect, useState } from "react";
import { Plus, Check, X, Clock, UserX, Users } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";

const departments = [
  "Sales",
  "Inventory",
  "Finance",
  "Management",
  "Operations",
  "Other",
];

const attendanceStyles = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  leave: "bg-sky-100 text-sky-700",
};

export default function Employees() {
  const [tab, setTab] = useState("employees"); // 'employees' | 'attendance' | 'leave'
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    department: "Sales",
    position: "",
    branch: "",
    monthlySalary: "",
  });
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    const [empRes, attRes, leaveRes] = await Promise.all([
      api.get("/employees"),
      api.get("/employees/attendance/today"),
      api.get("/employees/leave-requests"),
    ]);
    setEmployees(empRes.data);
    setTodayAttendance(attRes.data);
    setLeaveRequests(leaveRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddEmployee(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/employees", {
        ...form,
        monthlySalary: Number(form.monthlySalary) || 0,
      });
      setModalOpen(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        department: "Sales",
        position: "",
        branch: "",
        monthlySalary: "",
      });
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function markStatus(employeeId, status) {
    await api.post(`/employees/${employeeId}/attendance`, { status });
    const { data } = await api.get("/employees/attendance/today");
    setTodayAttendance(data);
  }

  async function handleReview(requestId, decision) {
    await api.post(`/employees/leave-requests/${requestId}/review`, {
      decision,
    });
    const { data } = await api.get("/employees/leave-requests");
    setLeaveRequests(data);
  }

  const activeCount = employees.filter((e) => e.status === "active").length;
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const pendingLeave = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Employees</h1>
          <p className="text-sm text-ink-900/60">
            Staff, attendance, and leave
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-forest-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-900/50">
            Active Employees
          </p>
          <p className="text-2xl font-bold text-forest-950">{activeCount}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-emerald-700/70">
            Present Today
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {presentToday}/{activeCount}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-amber-700/70">
            Pending Leave Requests
          </p>
          <p className="text-2xl font-bold text-amber-700">{pendingLeave}</p>
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        {[
          { key: "employees", label: "Employees", icon: Users },
          { key: "attendance", label: "Today's Attendance", icon: Clock },
          { key: "leave", label: "Leave Requests", icon: UserX },
        ].map(({ key, label, icon: Icon }) => (
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
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-900/50">Loading...</p>
      ) : tab === "employees" ? (
        <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Monthly Salary</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {emp.name}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {emp.department}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">{emp.position}</td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {emp.phone || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {emp.monthlySalary.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${emp.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-ink-900/40"
                  >
                    No employees yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : tab === "attendance" ? (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
          {todayAttendance.length === 0 ? (
            <p className="p-6 text-sm text-ink-900/50">
              No active employees to mark attendance for.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {todayAttendance.map((a) => (
                <div
                  key={a.employeeId}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-forest-950">
                      {a.name}
                    </p>
                    <p className="text-xs text-ink-900/50">{a.position}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${attendanceStyles[a.status]}`}
                      >
                        {a.status}
                      </span>
                    )}
                    {["present", "late", "absent", "leave"].map((s) => (
                      <button
                        key={s}
                        onClick={() => markStatus(a.employeeId, s)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs capitalize ${
                          a.status === s
                            ? "border-forest-700 bg-forest-50 text-forest-900"
                            : "border-black/10 text-ink-900/50 hover:bg-black/5"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
          {leaveRequests.length === 0 ? (
            <p className="p-6 text-sm text-ink-900/50">No leave requests.</p>
          ) : (
            <div className="divide-y divide-black/5">
              {leaveRequests.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-forest-950">
                      {r.employee?.name}
                    </p>
                    <p className="text-xs text-ink-900/50">
                      {new Date(r.startDate).toLocaleDateString()} –{" "}
                      {new Date(r.endDate).toLocaleDateString()}
                      {r.reason ? ` · ${r.reason}` : ""}
                    </p>
                  </div>
                  {r.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(r._id, "approved")}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(r._id, "rejected")}
                        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${r.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                      {r.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Employee"
      >
        <form onSubmit={handleAddEmployee}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Position
              </label>
              <input
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: e.target.value }))
                }
                placeholder="e.g. Cashier"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Branch
              </label>
              <input
                value={form.branch}
                onChange={(e) =>
                  setForm((f) => ({ ...f, branch: e.target.value }))
                }
                placeholder="e.g. Main Branch"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Monthly Salary (ETB)
              </label>
              <input
                type="number"
                min="0"
                value={form.monthlySalary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlySalary: e.target.value }))
                }
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Add Employee
          </button>
        </form>
      </Modal>
    </div>
  );
}
