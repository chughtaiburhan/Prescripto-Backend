import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { authUser } from "@/middleware/authUser";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const userId = await authUser(request);
    if (typeof userId === "object") {
      return userId; // Error response
    }

    const { docId, slotDate, slotTime } = await request.json();

    if (!docId || !slotDate || !slotTime) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find doctor
    const doctor = await Doctor.findById(docId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Check doctor availability
    if (!doctor.available) {
      return NextResponse.json(
        { success: false, message: "Doctor is not available" },
        { status: 400 }
      );
    }

    // Check if the slot is already booked
    const slot_booked = doctor.slot_booked || {};
    if (slot_booked[slotDate] && slot_booked[slotDate].includes(slotTime)) {
      return NextResponse.json(
        { success: false, message: "Slot is not available" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Create appointment
    const appointment = new Appointment({
      userId,
      docId,
      slotDate,
      slotTime,
      amount: doctor.fees || 100,
      date: new Date().toString(),
      docDate: new Date().toISOString(),
      userDate: new Date().toISOString(),
      cancelled: false,
      payment: "pending",
      isCompleted: false,
    });

    await appointment.save();

    // Update booked slot in doctor model
    if (slot_booked[slotDate]) {
      slot_booked[slotDate].push(slotTime);
    } else {
      slot_booked[slotDate] = [slotTime];
    }

    await Doctor.findByIdAndUpdate(docId, { slot_booked });

    return NextResponse.json({
      success: true,
      message: "Appointment has been booked",
      appointment: {
        _id: appointment._id,
        userId: appointment.userId,
        docId: appointment.docId,
        slotDate: appointment.slotDate,
        slotTime: appointment.slotTime,
        amount: appointment.amount,
        date: appointment.date,
        cancelled: appointment.cancelled,
        payment: appointment.payment,
        isCompleted: appointment.isCompleted,
      },
    });
  } catch (error: any) {
    console.error("Appointment booking error:", error);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
