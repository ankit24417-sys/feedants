import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { seedIfEmpty } from "../utils/seedData.js";
import "dotenv/config";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined in .env");
    }

    // High-concurrency connection pool tuning for 10k concurrent requests
    const connectionInstance = await mongoose.connect(mongoUri, {
      dbName: DB_NAME,
      maxPoolSize: 100, // Maintain up to 100 socket connections per process
      minPoolSize: 10, // Pre-warmed pool for immediate response without handshake lag
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log(
      `[Database] Connected successfully to host: ${connectionInstance.connection.host} | DB: ${DB_NAME}`
    );

    // Auto-seed initial demo data if database is empty
    await seedIfEmpty();

    return connectionInstance;
  } catch (err) {
    console.error("[Database] Connection Failed:", err.message);
    process.exit(1);
  }
};

export { connectDB };
