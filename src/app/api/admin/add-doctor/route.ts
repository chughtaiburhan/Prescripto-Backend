import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { authAdmin } from "@/middleware/authAdmin";
import { uploadImage, getDefaultDoctorImage } from "@/lib/image-utils";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await dbConnect();
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: "All fields required" },
      { status: 400 }
    );
  }

  const existing = await Doctor.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "Email already registered" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const doctor = await Doctor.create({ name, email, password: hashedPassword });

  return NextResponse.json({
    success: true,
    message: "Doctor registered",
    doctor: { name: doctor.name, email: doctor.email },
  });
}
