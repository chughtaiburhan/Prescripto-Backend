import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { authAdmin } from "@/middleware/authAdmin";
import { createSuccessResponse, handleDatabaseError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate admin
    const authResult = await authAdmin(request);
    if (authResult !== true) {
      return authResult; // Error response
    }

    // Optimized query with population and indexing
    const appointments = await Appointment.find({ userId: { $ne: null } })
      .populate("userId", "name dob email gender")
      .populate("docId", "name image speciality")
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Use lean() for better performance

    // Filter out invalid appointments and clean up
    const validAppointments = appointments.filter(
      (appt: any) => appt.userId && appt.docId
    );

    // Clean up invalid appointments in background (non-blocking)
    const invalidAppointments = appointments.filter(
      (appt: any) => !appt.userId || !appt.docId
    );

    if (invalidAppointments.length > 0) {
      // Delete invalid appointments asynchronously
      Appointment.deleteMany({
        _id: { $in: invalidAppointments.map((appt: any) => appt._id) },
      }).catch((error) => {
        console.error("Error cleaning up invalid appointments:", error);
      });
    }

    return createSuccessResponse({ appointment: validAppointments });
  } catch (error: any) {
    return handleDatabaseError(error, "Admin appointment list");
  }
}
