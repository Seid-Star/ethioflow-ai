import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Health check: proves the server is alive
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "EthioFlow AI",
    time: new Date().toISOString(),
  });
});

// Routes get mounted here as we build them (Day 2 onward):
// app.use('/api/auth', authRoutes)
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
