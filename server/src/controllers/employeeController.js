import asyncHandler from "express-async-handler";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ business: req.auth.business }).sort(
    "name",
  );
  res.json(employees);
});

// POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create({
    ...req.body,
    business: req.auth.business,
  });
  res.status(201).json(employee);
});

// PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    req.body,
    { new: true, runValidators: true },
  );
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json(employee);
});

// DELETE /api/employees/:id — soft delete (deactivate), keeps attendance/leave history intact
export const deactivateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    { status: "inactive" },
    { new: true },
  );
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json(employee);
});

// GET /api/employees/attendance/today — today's attendance sheet for every active employee
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const employees = await Employee.find({
    business: req.auth.business,
    status: "active",
  }).sort("name");
  const today = startOfDay();

  const records = await Attendance.find({
    business: req.auth.business,
    date: today,
  });
  const recordMap = {};
  for (const r of records) recordMap[r.employee.toString()] = r.status;

  res.json(
    employees.map((e) => ({
      employeeId: e._id,
      name: e.name,
      position: e.position,
      status: recordMap[e._id.toString()] || null, // null = not yet marked today
    })),
  );
});

// POST /api/employees/:id/attendance — mark (or update) today's attendance for one employee
export const markAttendance = asyncHandler(async (req, res) => {
  const { status, date } = req.body;
  if (!["present", "absent", "late", "leave"].includes(status)) {
    res.status(400);
    throw new Error("Invalid attendance status");
  }

  const employee = await Employee.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const day = startOfDay(date ? new Date(date) : new Date());

  const record = await Attendance.findOneAndUpdate(
    { business: req.auth.business, employee: employee._id, date: day },
    { status, recordedBy: req.auth.id },
    { new: true, upsert: true, runValidators: true },
  );

  res.json(record);
});

// GET /api/employees/:id/attendance — full attendance history for one employee
export const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({
    business: req.auth.business,
    employee: req.params.id,
  })
    .sort("-date")
    .limit(60);
  res.json(records);
});

// --- Leave requests ---

// GET /api/employees/leave-requests
export const getLeaveRequests = asyncHandler(async (req, res) => {
  const requests = await LeaveRequest.find({ business: req.auth.business })
    .populate("employee", "name position")
    .sort("-createdAt");
  res.json(requests);
});

// POST /api/employees/:id/leave-requests
export const createLeaveRequest = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error("Start and end date are required");
  }

  const employee = await Employee.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const request = await LeaveRequest.create({
    business: req.auth.business,
    employee: employee._id,
    startDate,
    endDate,
    reason,
  });
  res.status(201).json(request);
});

// POST /api/employees/leave-requests/:id/review — approve or reject
export const reviewLeaveRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  if (!["approved", "rejected"].includes(decision)) {
    res.status(400);
    throw new Error('Decision must be "approved" or "rejected"');
  }

  const request = await LeaveRequest.findOneAndUpdate(
    { _id: req.params.id, business: req.auth.business },
    { status: decision, reviewedBy: req.auth.id },
    { new: true },
  );
  if (!request) {
    res.status(404);
    throw new Error("Leave request not found");
  }
  res.json(request);
});
