import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { protect, authorize } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import { scanReceipt } from "../controllers/ocrController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const ocrLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many receipt scans in a short time. Please wait a moment.",
  },
});

const router = Router();
router.use(protect);

router.post(
  "/scan-receipt",
  ocrLimiter,
  authorize("owner", "manager"),
  requirePlan("professional", "Receipt scanning"),
  upload.single("receipt"),
  scanReceipt,
);

export default router;
