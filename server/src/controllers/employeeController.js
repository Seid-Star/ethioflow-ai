import asyncHandler from "express-async-handler";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Every calendar day from start to end, capped so a typo can't create thousands of records
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

// DELETE /api/employees/:id (deactivates, keeps attendance/leave history intact)
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

// GET /api/employees/attendance/today
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
      status: recordMap[e._id.toString()] || null,
    })),
  );
});

// POST /api/employees/:id/attendance
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

// GET /api/employees/:id/attendance
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

// POST /api/employees/:id/leave-requests (a manager records it on the employee's behalf)
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

// POST /api/employees/leave-requests/:id/review
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

  // Approved leave shows up as "Leave" in the attendance sheet for every day it covers
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
