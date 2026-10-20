import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";

import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import { ApiError } from "./utils/apiError.js";

// Route imports
import competitionRouter from "./routes/competition.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import userRouter from "./routes/user.routes.js";
import exploreRouter from "./routes/explore.routes.js";
import championRouter from "./routes/champion.routes.js";
import healthRouter from "./routes/health.routes.js";

const app = express();

// High-performance security & compression headers
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

// High-throughput rate limiter
app.use(apiLimiter);

// Logger (minimal in production for zero overhead)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Payload parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// API Routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/competitions", competitionRouter);
app.use("/api/v1/submissions", submissionRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/explore", exploreRouter);
app.use("/api/v1/champions", championRouter);

// 404 Route Handler
app.use((req, res, next) => {
  throw new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`);
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode =
    err.statusCode ||
    (typeof err.code === "number" && err.code >= 100 && err.code < 600
      ? err.code
      : 500);

  res.status(statusCode).json({
    statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

export { app };
