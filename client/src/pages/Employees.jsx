import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Check,
  X,
  Users,
  UserX,
  CalendarPlus,
  ClipboardCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Save,
} from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import Modal from "../components/ui/Modal";

const departments = [
  "Sales",
  "Inventory",
  "Finance",
  "Management",
  "Operations",
  "Other",
];
const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700";

const dayCount = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
const fmtDate = (d) => new Date(d).toLocaleDateString();
const localDate = (d = new Date()) => d.toLocaleDateString("en-CA");

const STATUS_META = {
  present: {
    label: "Present",
    on: "border-emerald-600 bg-emerald-600 text-white",
  },
  late: { label: "Late", on: "border-amber-500 bg-amber-500 text-white" },
  absent: { label: "Absent", on: "border-red-600 bg-red-600 text-white" },
  leave: { label: "Leave", on: "border-sky-600 bg-sky-600 text-white" },
};

const CELL = {
  present: ["P", "bg-emerald-100 text-emerald-700"],
  late: ["L", "bg-amber-100 text-amber-700"],
  absent: ["A", "bg-red-100 text-red-700"],
  leave: ["V", "bg-sky-100 text-sky-700"],
};

export default function Employees() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = ["owner", "manager"].includes(role);

  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [todayRows, setTodayRows] = useState([]);
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

  async function loadToday() {
    const { data } = await api.get("/employees/attendance", {
      params: { date: localDate() },
    });
    setTodayRows(data.rows);
  }

  async function loadAll() {
    setLoading(true);
    const [empRes, leaveRes] = await Promise.all([
      api.get("/employees"),
      api.get("/employees/leave-requests"),
    ]);
    setEmployees(empRes.data);
    setLeaveRequests(leaveRes.data);
    await loadToday();
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

  async function handleReview(requestId, decision) {
    setReviewError("");
    try {
      await api.post(`/employees/leave-requests/${requestId}/review`, {
        decision,
      });
      const { data } = await api.get("/employees/leave-requests");
      setLeaveRequests(data);
      loadToday();
    } catch (err) {
      setReviewError(
        err?.response?.data?.message || "Could not review this request",
      );
    }
  }

  const activeEmployees = employees.filter((e) => e.status === "active");
  const inToday = todayRows.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;
  const pendingLeave = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const tabs = [
    { key: "employees", label: "Employees", icon: Users },
    { key: "attendance", label: "Attendance", icon: ClipboardCheck },
    { key: "records", label: "Records", icon: CalendarDays },
    { key: "leave", label: "Leave Requests", icon: UserX },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Employees</h1>
          <p className="text-sm text-ink-900/60">
            Staff, attendance, and leave
          </p>
        </div>
        {canEdit && (
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
        )}
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
            At Work Today
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {inToday}/{todayRows.length}
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
        {tabs.map(({ key, label, icon: Icon }) => (
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

      {tab === "employees" &&
        (loading ? (
          <p className="text-sm text-ink-900/50">Loading...</p>
        ) : (
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
                    <td className="px-5 py-3 text-ink-900/60">
                      {emp.position}
                    </td>
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
        ))}
      <div className={tab === "attendance" ? "" : "hidden"}>
        <AttendanceTab
          canEdit={canEdit}
          onSaved={(d) => d === localDate() && loadToday()}
        />
      </div>

      {tab === "records" && <RecordsTab />}

      {tab === "leave" && (
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
                {canEdit && (
                  <button
                    onClick={() => setLeaveModalOpen(true)}
                    className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-600"
                  >
                    Record a leave request
                  </button>
                )}
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
                    {r.status === "pending" && canEdit ? (
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
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          r.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
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

function AttendanceTab({ canEdit, onSaved }) {
  const today = localDate();
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (d) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/employees/attendance", {
        params: { date: d },
      });
      setRows(data.rows);
      setDraft(
        Object.fromEntries(
          data.rows
            .filter((r) => r.status)
            .map((r) => [r.employeeId, r.status]),
        ),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  const changes = rows.filter(
    (r) => draft[r.employeeId] && draft[r.employeeId] !== r.status,
  );
  const counts = { present: 0, late: 0, absent: 0, leave: 0 };
  rows.forEach((r) => {
    if (draft[r.employeeId]) counts[draft[r.employeeId]] += 1;
  });
  const notMarked = rows.filter((r) => !draft[r.employeeId]).length;

  function changeDate(next) {
    if (next === date) return;
    if (
      changes.length > 0 &&
      !confirm("You have unsaved attendance. Discard it and change the date?")
    )
      return;
    setNotice("");
    setDate(next);
  }

  function shiftDay(delta) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + delta);
    const next = localDate(d);
    if (next > today) return;
    changeDate(next);
  }

  function setStatus(employeeId, status) {
    setNotice("");
    setDraft((d) => ({ ...d, [employeeId]: status }));
  }

  function markRestPresent() {
    setNotice("");
    setDraft((d) => {
      const next = { ...d };
      rows.forEach((r) => {
        if (!next[r.employeeId]) next[r.employeeId] = "present";
      });
      return next;
    });
  }

  async function save() {
    if (changes.length === 0) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/employees/attendance/bulk", {
        date,
        records: changes.map((r) => ({
          employeeId: r.employeeId,
          status: draft[r.employeeId],
        })),
      });
      await load(date);
      setNotice(
        `Saved attendance for ${data.saved} employee${data.saved === 1 ? "" : "s"}.`,
      );
      onSaved?.(date);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not save attendance. Your marks are still here, so try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const heading = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white p-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftDay(-1)}
            className="rounded-lg border border-black/10 p-2 hover:bg-black/5"
            title="Previous day"
          >
            <ChevronLeft size={15} />
          </button>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => e.target.value && changeDate(e.target.value)}
            className="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
          />
          <button
            onClick={() => shiftDay(1)}
            disabled={date >= today}
            className="rounded-lg border border-black/10 p-2 hover:bg-black/5 disabled:opacity-30"
            title="Next day"
          >
            <ChevronRight size={15} />
          </button>
          {date !== today && (
            <button
              onClick={() => changeDate(today)}
              className="ml-1 rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-medium text-forest-900"
            >
              Today
            </button>
          )}
        </div>

        {canEdit && (
          <button
            onClick={markRestPresent}
            disabled={notMarked === 0}
            className="flex items-center gap-1.5 rounded-full border border-emerald-600/40 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
            title="Marks everyone who is not marked yet as present"
          >
            <CheckCheck size={14} /> Mark all present
          </button>
        )}
      </div>

      <p className="mb-3 px-1 text-sm font-medium text-forest-950">{heading}</p>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No active employees to mark attendance for.
          </p>
        ) : (
          <div className="divide-y divide-black/5">
            {rows.map((r) => {
              const current = draft[r.employeeId];
              const edited = current && current !== r.status;
              return (
                <div
                  key={r.employeeId}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-forest-950">
                      {r.name}
                      {edited && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-gold-500"
                          title="Not saved yet"
                        />
                      )}
                    </p>
                    <p className="text-xs text-ink-900/50">{r.position}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {Object.entries(STATUS_META).map(([status, meta]) => (
                      <button
                        key={status}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setStatus(r.employeeId, status)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-default ${
                          current === status
                            ? meta.on
                            : "border-black/10 text-ink-900/55 hover:bg-black/5"
                        }`}
                      >
                        {meta.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="sticky bottom-3 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-5 py-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-900/60">
            <span>
              <b className="text-emerald-700">{counts.present}</b> present
            </span>
            <span>
              <b className="text-amber-600">{counts.late}</b> late
            </span>
            <span>
              <b className="text-red-600">{counts.absent}</b> absent
            </span>
            <span>
              <b className="text-sky-700">{counts.leave}</b> leave
            </span>
            {notMarked > 0 && (
              <span className="font-medium text-amber-700">
                {notMarked} not marked
              </span>
            )}
          </div>

          {canEdit ? (
            <button
              onClick={save}
              disabled={changes.length === 0 || saving}
              className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-40"
            >
              <Save size={15} />
              {saving
                ? "Saving..."
                : changes.length > 0
                  ? `Save attendance (${changes.length} change${changes.length === 1 ? "" : "s"})`
                  : "Saved"}
            </button>
          ) : (
            <p className="text-xs text-ink-900/45">
              Only owners and managers can record attendance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RecordsTab() {
  const thisMonth = localDate().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get("/employees/attendance/records", { params: { month } })
      .then(({ data }) => !cancelled && setData(data))
      .catch(
        (err) =>
          !cancelled &&
          setError(
            err?.response?.data?.message || "Could not load the records",
          ),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month]);

  function shift(delta) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next <= thisMonth) setMonth(next);
  }

  const [y, m] = month.split("-").map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const todayDay = month === thisMonth ? new Date().getDate() : null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => shift(-1)}
          className="rounded-lg border border-black/10 p-2 hover:bg-black/5"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="min-w-40 text-center text-sm font-semibold text-forest-950">
          {label}
        </p>
        <button
          onClick={() => shift(1)}
          disabled={month >= thisMonth}
          className="rounded-lg border border-black/10 p-2 hover:bg-black/5 disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : loading || !data ? (
        <p className="text-sm text-ink-900/50">Loading...</p>
      ) : data.rows.length === 0 ? (
        <p className="rounded-2xl border border-black/5 bg-white p-6 text-sm text-ink-900/50">
          No attendance recorded for this month.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-forest-50 text-ink-900/55">
                  <th className="sticky left-0 z-10 min-w-40 bg-forest-50 px-4 py-2.5 text-left font-medium">
                    Employee
                  </th>
                  {Array.from(
                    { length: data.daysInMonth },
                    (_, i) => i + 1,
                  ).map((d) => (
                    <th
                      key={d}
                      className={`min-w-7 px-0.5 py-2.5 font-medium ${d === todayDay ? "text-forest-950" : ""}`}
                    >
                      {d}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 font-medium text-emerald-700">
                    P
                  </th>
                  <th className="px-2 py-2.5 font-medium text-amber-600">L</th>
                  <th className="px-2 py-2.5 font-medium text-red-600">A</th>
                  <th className="px-2 py-2.5 font-medium text-sky-700">V</th>
                  <th className="px-3 py-2.5 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => {
                  const worked = r.counts.present + r.counts.late;
                  const expected = worked + r.counts.absent;
                  return (
                    <tr key={r.employeeId} className="border-t border-black/5">
                      <td className="sticky left-0 z-10 bg-white px-4 py-2">
                        <p className="font-medium text-forest-950">{r.name}</p>
                        <p className="text-[10px] text-ink-900/45">
                          {r.status === "inactive" ? "Inactive" : r.position}
                        </p>
                      </td>
                      {Array.from(
                        { length: data.daysInMonth },
                        (_, i) => i + 1,
                      ).map((d) => {
                        const status = r.days[d];
                        const future = todayDay !== null && d > todayDay;
                        return (
                          <td
                            key={d}
                            className={`px-0.5 py-1.5 text-center ${future ? "opacity-30" : ""}`}
                          >
                            {status ? (
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${CELL[status][1]}`}
                              >
                                {CELL[status][0]}
                              </span>
                            ) : (
                              <span className="text-ink-900/20">·</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 text-center font-semibold text-emerald-700">
                        {r.counts.present}
                      </td>
                      <td className="px-2 text-center font-semibold text-amber-600">
                        {r.counts.late}
                      </td>
                      <td className="px-2 text-center font-semibold text-red-600">
                        {r.counts.absent}
                      </td>
                      <td className="px-2 text-center font-semibold text-sky-700">
                        {r.counts.leave}
                      </td>
                      <td className="px-3 text-center font-semibold text-forest-950">
                        {expected > 0
                          ? `${Math.round((worked / expected) * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-ink-900/45">
            P present · L late · A absent · V leave · a dot means not recorded.
            Rate counts present and late days against absences; leave days are
            not counted against anyone.
          </p>
        </>
      )}
    </div>
  );
}

function LeaveRequestModal({ employees, onClose, onCreated }) {
  const today = localDate();
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
