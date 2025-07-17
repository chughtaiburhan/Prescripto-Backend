import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { createSuccessResponse, handleDatabaseError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    console.log("Starting doctors list API...");

    // Test database connection
    await dbConnect();
    console.log("Database connected successfully");

    // Optimized query with specific field selection and indexing
    const doctors = await Doctor.find({})
      .select(
        "name image speciality degree experience about available fees address slot_booked"
      )
      .lean(); // Use lean() for better performance when you don't need Mongoose documents

    console.log(`Found ${doctors.length} doctors`);
    return createSuccessResponse({ doctors });
  } catch (error: any) {
    console.error("Doctors list error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return handleDatabaseError(error, "Doctor list");
  }
}
