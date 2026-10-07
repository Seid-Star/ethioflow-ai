import { Router } from "express";
import multer from "multer";
import { protect, authorize } from "../middleware/auth.js";
import { scanReceipt } from "../controllers/ocrController.js";

const upload = multer({
  storage: multer.memoryStorage(), // we only need the bytes briefly, never saved to disk
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB cap
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const router = Router();
router.use(protect);

router.post(
  "/scan-receipt",
  authorize("owner", "manager"),
  upload.single("receipt"),
  scanReceipt,
);
import rateLimit from "express-rate-limit";

const ocrLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many receipt scans in a short time. Please wait a moment.",
  },
});
router.post(
  "/scan-receipt",
  ocrLimiter,
  authorize("owner", "manager"),
  upload.single("receipt"),
  scanReceipt,
);
export default router;
