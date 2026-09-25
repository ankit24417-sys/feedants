import cluster from "cluster";
import os from "os";
import http from "http";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

// Determine worker count for 10k concurrent request scalability
const configuredWorkers = parseInt(process.env.MAX_WORKERS, 10);
const numCPUs = os.cpus().length;
const totalWorkers =
  configuredWorkers > 0 ? configuredWorkers : Math.max(1, numCPUs);

// Master / Primary cluster fork logic
if (cluster.isPrimary && process.env.NODE_ENV === "production") {
  console.log(`====================================================`);
  console.log(`[Cluster Primary ${process.pid}] Starting Feedants Backend`);
  console.log(`[Cluster Primary] Forking ${totalWorkers} worker processes`);
  console.log(`[Concurrency] Tuned for 10,000+ concurrent requests`);
  console.log(`====================================================`);

  for (let i = 0; i < totalWorkers; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(
      `[Cluster] Worker ${worker.process.pid} exited (signal: ${signal} | code: ${code}). Respawning...`
    );
    cluster.fork();
  });
} else {
  // Worker process or single-instance dev server
  connectDB()
    .then(() => {
      const server = http.createServer(app);

      // High-performance HTTP server tuning for 10k concurrent connections
      server.keepAliveTimeout = 65000; // 65 seconds
      server.headersTimeout = 66000;   // Must be > keepAliveTimeout
      server.maxRequestsPerClient = 0; // Unlimited requests over keep-alive

      server.listen(PORT, "0.0.0.0", () => {
        console.log(
          `[Server Worker ${process.pid}] Listening at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`
        );
      });

      // Graceful shutdown handling
      const shutdown = (signal) => {
        console.log(`[Server Worker ${process.pid}] Received ${signal}. Closing gracefully...`);
        server.close(() => {
          console.log(`[Server Worker ${process.pid}] HTTP server closed.`);
          process.exit(0);
        });
      };

      process.on("SIGTERM", () => shutdown("SIGTERM"));
      process.on("SIGINT", () => shutdown("SIGINT"));
    })
    .catch((err) => {
      console.error(`[Server Error] Database connection failed:`, err.message);
      process.exit(1);
    });
}
