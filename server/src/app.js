import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import { auditTrail } from "./middleware/auditTrail.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
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

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(sanitizeBody);
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "EthioFlow AI",
    time: new Date().toISOString(),
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please slow down." },
});
app.use("/api", apiLimiter);

app.use("/api", auditTrail);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
