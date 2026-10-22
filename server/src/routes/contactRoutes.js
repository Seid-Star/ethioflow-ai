import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "../controllers/contactController.js";

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "You have sent a few messages already. Please try again in a little while.",
  },
});

const router = Router();

router.post("/", contactLimiter, submitContact);

export default router;
