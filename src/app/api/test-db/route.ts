import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Database test started...");

    // Test database connection with timeout
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 10000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);

    console.log("Database connection successful");

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      mongodb: {
        connected: true,
        uri: process.env.mongoatlasURI ? "Configured" : "Not configured",
      },
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed: " + error.message,
        timestamp: new Date().toISOString(),
        mongodb: {
          connected: false,
          uri: process.env.mongoatlasURI ? "Configured" : "Not configured",
        },
      },
      { status: 500 }
    );
  }
}
