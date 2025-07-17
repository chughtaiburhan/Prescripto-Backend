import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { authUser } from "@/middleware/authUser";
import {
  createSuccessResponse,
  handleDatabaseError
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const userId = await authUser(request);
    if (typeof userId === "object") {
      return userId; // Error response
    }

    // Optimized query with population and indexing
    const appointments = await Appointment.find({ userId })
      .populate("docId", "name image address speciality")
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Use lean() for better performance

    return createSuccessResponse({ appointment: appointments });

  } catch (error: any) {
    return handleDatabaseError(error, "List appointments");
  }
}
