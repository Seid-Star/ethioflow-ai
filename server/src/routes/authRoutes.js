import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  refresh,
  logout,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validateRegister, validateLogin } from "../validators/index.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later." },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: {
    message:
      "Too many emails requested. Please wait a few minutes and try again.",
  },
});
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many password reset attempts. Please try again later.",
  },
});

router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);

router.post("/register", authLimiter, validateRegister, validate, register);
router.post("/login", authLimiter, validateLogin, validate, login);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", resendLimiter, resendVerification);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
