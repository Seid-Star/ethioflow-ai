import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// Recursively strips any object keys starting with "$" or containing "." from
// req.body only — this blocks MongoDB operator injection (e.g. { "$gt": "" })
// without touching req.query, which Express 5 made read-only.
function sanitizeMongoOperators(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(sanitizeMongoOperators);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        sanitizeMongoOperators(obj[key]);
      }
    }
  }
}

function sanitizeBody(req, res, next) {
  sanitizeMongoOperators(req.body);
  next();
}
const app = express();
app.use(helmet()); // sets secure HTTP headers (prevents clickjacking, MIME sniffing, etc.)

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.json());
app.use(sanitizeBody);
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/sync", syncRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ocr", ocrRoutes);
// Health check: proves the server is alive
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "EthioFlow AI",
    time: new Date().toISOString(),
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use(notFound);
app.use(errorHandler);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // generous for normal use, still blocks abuse/bugs that hammer the API
  message: { message: "Too many requests. Please slow down." },
});
app.use("/api", apiLimiter);
export default app;
