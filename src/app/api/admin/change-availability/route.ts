import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { authAdmin } from "@/middleware/authAdmin";
import {
  validateRequest,
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
} from "@/lib/api-utils";

// Force dynamic rendering since this route uses request.headers
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate admin
    const authResult = await authAdmin(request);
    if (authResult !== true) {
      return authResult; // Error response
    }

    // Validate request body
    const { error, body } = await validateRequest(request, ["docId"]);
    if (error) return error;

    const { docId } = body;

    // Find doctor and toggle availability
    const doctor = await Doctor.findById(docId);
    if (!doctor) {
      return createErrorResponse("Doctor not found", 404);
    }

    // Toggle availability
    doctor.available = !doctor.available;
    await doctor.save();

    return createSuccessResponse(
      {
        available: doctor.available,
      },
      `Doctor ${
        doctor.available ? "made available" : "made unavailable"
      } successfully`
    );
  } catch (error: any) {
    return handleDatabaseError(error, "Change availability");
  }
}
