import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import { authDoctor } from "@/middleware/authDoctor";
import {
  validateRequest,
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
  createAppointmentData,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate doctor
    const doctorId = await authDoctor(request);
    if (typeof doctorId === "object") {
      return doctorId; // Error response
    }

    // Validate request body
    const { error, body } = await validateRequest(request, [
      "docId",
      "slotDate",
      "slotTime",
    ]);
    if (error) return error;

    const { docId, slotDate, slotTime } = body;

    // Find doctor with optimized query
    const docData = await Doctor.findById(docId).select("-password");
    if (!docData) {
      return createErrorResponse("Doctor not found", 404);
    }

    // Check doctor availability
    if (!docData.available) {
      return createErrorResponse("Doctor is not available");
    }

    // Check if the slot is already booked
    const slot_booked = docData.slot_booked || {};
    if (slot_booked[slotDate] && slot_booked[slotDate].includes(slotTime)) {
      return createErrorResponse("Slot is not available");
    }

    // Create appointment data
    const appointmentData = createAppointmentData(
      doctorId, // Using doctorId as userId for doctor appointments
      docId,
      slotDate,
      slotTime,
      docData.fees || 100
    );

    // Use transaction for data consistency
    const session = await dbConnect().startSession();
    try {
      await session.withTransaction(async () => {
        // Save appointment
        const newAppointment = new Appointment(appointmentData);
        await newAppointment.save({ session });

        // Update booked slot in doctor model
        if (slot_booked[slotDate]) {
          slot_booked[slotDate].push(slotTime);
        } else {
          slot_booked[slotDate] = [slotTime];
        }
        await Doctor.findByIdAndUpdate(docId, { slot_booked }, { session });
      });
    } finally {
      await session.endSession();
    }

    return createSuccessResponse({}, "Appointment has been booked");
  } catch (error: any) {
    return handleDatabaseError(error, "Doctor appointment booking");
  }
}
