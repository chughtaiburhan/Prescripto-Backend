import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { authAdmin } from "@/middleware/authAdmin";
import { createSuccessResponse, handleDatabaseError } from "@/lib/api-utils";

// Force dynamic rendering since this route uses request.headers
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate admin
    const authResult = await authAdmin(request);
    if (authResult !== true) {
      return authResult; // Error response
    }

    // Optimized query with specific field selection and indexing
    const doctors = await Doctor.find({})
      .select("-password")
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Use lean() for better performance

    return createSuccessResponse({ doctors });
  } catch (error: any) {
    return handleDatabaseError(error, "Get all doctors");
  }
}
