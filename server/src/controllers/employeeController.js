import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const STATUSES = ["present", "late", "absent", "leave"];

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const day = new Date(y, m - 1, d);
  return day.getDate() === d ? day : null;
}

function isFutureDay(day) {
  return day.getTime() > startOfDay(new Date(Date.now() + DAY_MS)).getTime();
}

function daysBetween(start, end) {
  const days = [];
  const d = startOfDay(start);
  const last = startOfDay(end);
  while (d <= last && days.length < 62) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ business: req.auth.business }).sort(
    "name",
  );
  res.json(employees);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create({
    ...req.body,
    business: req.auth.business,
  });
  res.status(201).json(employee);
});

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

export const getAttendanceSheet = asyncHandler(async (req, res) => {
  const day = parseDay(req.query.date) || startOfDay();

  const employees = await Employee.find({
    business: req.auth.business,
    status: "active",
  }).sort("name");
  const records = await Attendance.find({
    business: req.auth.business,
    date: day,
  });

  const statusById = {};
  for (const r of records) statusById[r.employee.toString()] = r.status;

  res.json({
    date: req.query.date,
    rows: employees.map((e) => ({
      employeeId: e._id,
      name: e.name,
      position: e.position,
      department: e.department,
      status: statusById[e._id.toString()] || null,
    })),
  });
});

export const saveAttendanceBulk = asyncHandler(async (req, res) => {
  const { date, records } = req.body;

  const day = parseDay(date);
  if (!day) {
    res.status(400);
    throw new Error("A valid date is required (YYYY-MM-DD)");
  }
  if (isFutureDay(day)) {
    res.status(400);
    throw new Error("Attendance cannot be recorded for a future date");
  }
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error("There is no attendance to save");
  }
  if (records.length > 500) {
    res.status(400);
    throw new Error("Too many records in one save");
  }

  const byEmployee = new Map();
  for (const r of records) {
    if (
      !mongoose.isValidObjectId(r?.employeeId) ||
      !STATUSES.includes(r?.status)
    ) {
      res.status(400);
      throw new Error("Each record needs a valid employee and status");
    }
    byEmployee.set(String(r.employeeId), r.status);
  }

  const valid = await Employee.find({
    business: req.auth.business,
    status: "active",
    _id: { $in: [...byEmployee.keys()] },
  }).select("_id");

  if (valid.length !== byEmployee.size) {
    res.status(400);
    throw new Error(
      "Some employees could not be found. Refresh the page and try again.",
    );
  }

  await Attendance.bulkWrite(
    [...byEmployee.entries()].map(([employeeId, status]) => ({
      updateOne: {
        filter: {
          business: req.auth.business,
          employee: employeeId,
          date: day,
        },
        update: { $set: { status, recordedBy: req.auth.id } },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  res.json({ saved: byEmployee.size, date });
});

export const getAttendanceRecords = asyncHandler(async (req, res) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(req.query.month || ""));
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const month = match ? Number(match[2]) : now.getMonth() + 1;

  if (month < 1 || month > 12) {
    res.status(400);
    throw new Error("Invalid month");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  const [employees, records] = await Promise.all([
    Employee.find({ business: req.auth.business }).sort("name"),
    Attendance.find({
      business: req.auth.business,
      date: { $gte: start, $lt: end },
    }),
  ]);

  const byEmployee = {};
  for (const r of records) {
    const key = r.employee.toString();
    (byEmployee[key] ||= {})[r.date.getDate()] = r.status;
  }

  const rows = employees
    .filter((e) => e.status === "active" || byEmployee[e._id.toString()])
    .map((e) => {
      const days = byEmployee[e._id.toString()] || {};
      const counts = { present: 0, late: 0, absent: 0, leave: 0 };
      for (const status of Object.values(days)) counts[status] += 1;
      return {
        employeeId: e._id,
        name: e.name,
        position: e.position,
        status: e.status,
        days,
        counts,
      };
    });

  res.json({
    month: `${year}-${String(month).padStart(2, "0")}`,
    daysInMonth,
    rows,
  });
});

export const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({
    business: req.auth.business,
    employee: req.params.id,
  })
    .sort("-date")
    .limit(60);
  res.json(records);
});

export const getLeaveRequests = asyncHandler(async (req, res) => {
  const requests = await LeaveRequest.find({ business: req.auth.business })
    .populate("employee", "name position")
    .sort("-createdAt");
  res.json(requests);
});

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!startDate || !endDate || isNaN(start) || isNaN(end)) {
    res.status(400);
    throw new Error("Start and end date are required");
  }
  if (end < start) {
    res.status(400);
    throw new Error("The end date cannot be before the start date");
  }
  if (daysBetween(start, end).length > 60) {
    res.status(400);
    throw new Error("Leave cannot be longer than 60 days at a time");
  }

  const employee = await Employee.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  if (employee.status !== "active") {
    res.status(400);
    throw new Error("This employee is inactive");
  }

  const request = await LeaveRequest.create({
    business: req.auth.business,
    employee: employee._id,
    startDate: start,
    endDate: end,
    reason: reason?.trim() || undefined,
  });
  res.status(201).json(request);
});
export const reviewLeaveRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  if (!["approved", "rejected"].includes(decision)) {
    res.status(400);
    throw new Error('Decision must be "approved" or "rejected"');
  }

  const request = await LeaveRequest.findOne({
    _id: req.params.id,
    business: req.auth.business,
  });
  if (!request) {
    res.status(404);
    throw new Error("Leave request not found");
  }
  if (request.status !== "pending") {
    res.status(400);
    throw new Error("This request was already reviewed");
  }

  request.status = decision;
  request.reviewedBy = req.auth.id;
  await request.save();
  if (decision === "approved") {
    const days = daysBetween(request.startDate, request.endDate);
    await Attendance.bulkWrite(
      days.map((date) => ({
        updateOne: {
          filter: {
            business: req.auth.business,
            employee: request.employee,
            date,
          },
          update: { $set: { status: "leave", recordedBy: req.auth.id } },
          upsert: true,
        },
      })),
    );
  }

  res.json(request);
});
