import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import {
  validateRequest,
  validateEmail,
  validatePassword,
  hashPassword,
  generateJWT,
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
  createDoctorDefaults,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    const { error, body } = await validateRequest(request, [
      "role",
      "name",
      "email",
      "password",
    ]);
    if (error) return error;

    const { role, name, email, password } = body;

    // Validate role
    if (role !== "doctor") {
      return createErrorResponse(
        "Only doctor role is allowed for admin registration"
      );
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) return createErrorResponse(emailError);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) return createErrorResponse(passwordError);

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingDoctor) {
      return createErrorResponse("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create doctor with optimized data structure
    const doctorData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      ...createDoctorDefaults(),
    };

    const doctor = await Doctor.create(doctorData);

    // Generate JWT token
    const token = generateJWT(doctor._id);

    // Return success response with optimized data
    return createSuccessResponse(
      {
        token,
        doctorData: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          role: "doctor",
          available: doctor.available,
          fees: doctor.fees,
          speciality: doctor.speciality,
        },
      },
      "Doctor registered successfully"
    );
  } catch (error: any) {
    return handleDatabaseError(error, "Doctor registration");
  }
}
