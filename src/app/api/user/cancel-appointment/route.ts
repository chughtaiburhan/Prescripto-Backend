import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import { authUser } from "@/middleware/authUser";
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

    // Authenticate user
    const userId = await authUser(request);
    if (typeof userId === "object") {
      return userId; // Error response
    }

    // Validate request body
    const { error, body } = await validateRequest(request, ["appointmentId"]);
    if (error) return error;

    const { appointmentId } = body;

    // Find appointment with optimized query
    const appointmentData = await Appointment.findById(appointmentId).lean();
    if (!appointmentData) {
      return createErrorResponse("Appointment not found");
    }

    // Check authorization
    if ((appointmentData as any).userId.toString() !== userId) {
      return createErrorResponse("Unauthorized action", 403);
    }

    // Use transaction for data consistency
    const conn = await dbConnect();
    const session = await conn.startSession();
    try {
      await session.withTransaction(async () => {
        // Cancel appointment
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { cancelled: true },
          { session }
        );

        // Release doctor slot
        const { docId, slotDate, slotTime } = appointmentData as any;
        const doctorData = await Doctor.findById(docId).session(session);

        if (
          doctorData &&
          doctorData.slot_booked &&
          doctorData.slot_booked[slotDate]
        ) {
          doctorData.slot_booked[slotDate] = doctorData.slot_booked[
            slotDate
          ].filter((time: string) => time !== slotTime);
          await doctorData.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }

    return createSuccessResponse({}, "Appointment Cancelled");
  } catch (error: any) {
    return handleDatabaseError(error, "Cancel appointment");
  }
}
