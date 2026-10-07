import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  getTodayAttendance,
  markAttendance,
  getEmployeeAttendance,
  getLeaveRequests,
  createLeaveRequest,
  reviewLeaveRequest,
} from "../controllers/employeeController.js";

const router = Router();
router.use(protect);

const validateEmployee = [
  body("name").trim().notEmpty().withMessage("Employee name is required"),
  body("monthlySalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Salary cannot be negative"),
];

router.get("/", getEmployees);
router.post(
  "/",
  authorize("owner", "manager"),
  validateEmployee,
  validate,
  createEmployee,
);
router.put(
  "/:id",
  authorize("owner", "manager"),
  validateEmployee,
  validate,
  updateEmployee,
);
router.delete("/:id", authorize("owner", "manager"), deactivateEmployee);

router.get("/attendance/today", getTodayAttendance);
router.post("/:id/attendance", authorize("owner", "manager"), markAttendance);
router.get("/:id/attendance", getEmployeeAttendance);

router.get("/leave-requests", getLeaveRequests);
router.post(
  "/:id/leave-requests",
  authorize("owner", "manager"),
  createLeaveRequest,
);
router.post(
  "/leave-requests/:id/review",
  authorize("owner", "manager"),
  reviewLeaveRequest,
);

export default router;
