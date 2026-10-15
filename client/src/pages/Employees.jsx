import { useEffect, useState } from "react";
import {
  Plus,
  Check,
  X,
  Clock,
  UserX,
  Users,
  CalendarPlus,
} from "lucide-react";
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

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700";

const dayCount = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
const fmtDate = (d) => new Date(d).toLocaleDateString();
const localToday = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

export default function Employees() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
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
  const [reviewError, setReviewError] = useState("");

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
    setReviewError("");
    try {
      await api.post(`/employees/leave-requests/${requestId}/review`, {
        decision,
      });
      const [{ data: requests }, { data: attendance }] = await Promise.all([
        api.get("/employees/leave-requests"),
        api.get("/employees/attendance/today"),
      ]);
      setLeaveRequests(requests);
      setTodayAttendance(attendance); // approved leave may change today's sheet
    } catch (err) {
      setReviewError(
        err?.response?.data?.message || "Could not review this request",
      );
    }
  }

  const activeEmployees = employees.filter((e) => e.status === "active");
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const pendingLeave = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Employees</h1>
          <p className="text-sm text-ink-900/60">
            Staff, attendance, and leave
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-forest-950 hover:bg-black/5"
          >
            <CalendarPlus size={15} /> Leave Request
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-forest-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-900/50">
            Active Employees
          </p>
          <p className="text-2xl font-bold text-forest-950">
            {activeEmployees.length}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-emerald-700/70">
            Present Today
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {presentToday}/{activeEmployees.length}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-amber-700/70">
            Pending Leave Requests
          </p>
          <p className="text-2xl font-bold text-amber-700">{pendingLeave}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
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
            {key === "leave" && pendingLeave > 0 && (
              <span className="ml-0.5 rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-forest-950">
                {pendingLeave}
              </span>
            )}
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
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-forest-950">
                      {a.name}
                    </p>
                    <p className="text-xs text-ink-900/50">{a.position}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
        <div>
          {reviewError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {reviewError}
            </p>
          )}
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="mb-3 text-sm text-ink-900/50">
                  No leave requests yet.
                </p>
                <button
                  onClick={() => setLeaveModalOpen(true)}
                  className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-600"
                >
                  Record a leave request
                </button>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {leaveRequests.map((r) => (
                  <div
                    key={r._id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-forest-950">
                        {r.employee?.name}
                      </p>
                      <p className="text-xs text-ink-900/55">
                        {fmtDate(r.startDate)} – {fmtDate(r.endDate)} ·{" "}
                        {dayCount(r.startDate, r.endDate)} day
                        {dayCount(r.startDate, r.endDate) === 1 ? "" : "s"}
                        {r.reason ? ` · ${r.reason}` : ""}
                      </p>
                      {r.status === "approved" && (
                        <p className="mt-0.5 text-[11px] text-sky-700">
                          Marked as Leave in attendance
                        </p>
                      )}
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
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-3">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className={inputClass}
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
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                className={inputClass}
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
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2">
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
                className={inputClass}
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
                className={inputClass}
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

      {leaveModalOpen && (
        <LeaveRequestModal
          employees={activeEmployees}
          onClose={() => setLeaveModalOpen(false)}
          onCreated={() => {
            setLeaveModalOpen(false);
            setTab("leave");
            loadAll();
          }}
        />
      )}
    </div>
  );
}

function LeaveRequestModal({ employees, onClose, onCreated }) {
  const today = localToday();
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = employeeId && startDate && endDate && endDate >= startDate;
  const days =
    startDate && endDate && endDate >= startDate
      ? dayCount(startDate, endDate)
      : 0;

  function changeStart(value) {
    setStartDate(value);
    if (endDate < value) setEndDate(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/employees/${employeeId}/leave-requests`, {
        startDate,
        endDate,
        reason,
      });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save the request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Record Leave Request">
      {employees.length === 0 ? (
        <p className="text-sm text-ink-900/60">
          Add an employee first, then you can record their leave.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <p className="rounded-lg bg-forest-50 px-3 py-2 text-xs text-ink-900/60">
            When an employee asks for time off, record it here. You can then
            approve or reject it.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.position})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => changeStart(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                To
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Reason (optional)
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family event, sick leave"
              className={inputClass}
            />
          </div>

          {days > 0 && (
            <p className="text-center text-xs font-medium text-forest-700">
              {days} day{days === 1 ? "" : "s"} of leave
            </p>
          )}

          <button
            type="submit"
            disabled={!valid || submitting}
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save request"}
          </button>
        </form>
      )}
    </Modal>
  );
}
