/**
 * ============================================================
 * FILE: src/backend/config/db.ts
 * PURPOSE: Connects our Next.js app to the MongoDB database.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * Think of this file like turning on a tap before using water.
 * Before we can save or read any product data, we must first
 * "open a connection" to MongoDB Atlas (our online database).
 *
 * WHY CACHING?
 * In Next.js serverless (Vercel), each API request can start
 * a fresh function. Without caching, we would open hundreds
 * of new connections to MongoDB (very bad!). The caching trick
 * below reuses the same connection every time.
 */

import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach to global to survive hot-reloads in development
const globalAny = global as typeof global & { mongooseCache?: MongooseCache };

if (!globalAny.mongooseCache) {
  globalAny.mongooseCache = { conn: null, promise: null };
}

const cached = globalAny.mongooseCache;

/**
 * connectToDatabase()
 *
 * Call this function at the TOP of every API route or server function
 * before reading or writing to the database.
 *
 * Usage:
 *   import connectToDatabase from "@/backend/config/db";
 *   await connectToDatabase();
 */
async function connectToDatabase(): Promise<typeof mongoose | null> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn(
      "?? MONGODB_URI is not set. Please configure it in .env.local (local) or Vercel Environment Variables (production)."
    );
    return null;
  }

  // If already connected, return the existing connection immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is being established, wait for it
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("? MongoDB connected successfully!");
  } catch (error) {
    // Reset so the next call can retry
    cached.promise = null;
    console.error("? MongoDB connection error:", error);
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
