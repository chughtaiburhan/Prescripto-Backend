import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
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

    // Use aggregation for better performance
    const [userStats, doctorStats, appointmentStats] = await Promise.all([
      // Get user statistics
      User.aggregate([{ $group: { _id: null, totalUsers: { $sum: 1 } } }]),

      // Get doctor statistics
      Doctor.aggregate([{ $group: { _id: null, totalDoctors: { $sum: 1 } } }]),

      // Get appointment statistics
      Appointment.aggregate([
        { $group: { _id: null, totalAppointments: { $sum: 1 } } },
      ]),
    ]);

    // Extract results
    const totalUsers = userStats[0]?.totalUsers || 0;
    const totalDoctors = doctorStats[0]?.totalDoctors || 0;
    const totalAppointments = appointmentStats[0]?.totalAppointments || 0;

    return createSuccessResponse({
      totalUsers,
      totalDoctors,
      totalAppointments,
    });
  } catch (error: any) {
    return handleDatabaseError(error, "Dashboard stats");
  }
}
