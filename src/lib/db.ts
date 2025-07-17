import mongoose from "mongoose";

// Type declarations for global mongoose caching
declare global {
  var mongoose:
    | {
        conn: any;
        promise: any;
      }
    | undefined;
}

const MONGODB_URI =
  process.env.mongoatlasURI || "mongodb://localhost:27017/prescripto";

if (!process.env.mongoatlasURI) {
  console.warn(
    "Warning: Using fallback MongoDB URI. Please set mongoatlasURI in .env.local for production."
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
