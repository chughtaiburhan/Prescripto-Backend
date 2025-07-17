import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { createSuccessResponse, handleDatabaseError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Optimized query with specific field selection and indexing
    const doctors = await Doctor.find({})
      .select(
        "name image speciality degree experience about available fees address slot_booked"
      )
      .lean(); // Use lean() for better performance when you don't need Mongoose documents

    return createSuccessResponse({ doctors });
  } catch (error: any) {
    return handleDatabaseError(error, "Doctor list");
  }
}
