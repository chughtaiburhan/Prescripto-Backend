import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import {
  validateRequest,
  validateEmail,
  verifyPassword,
  generateJWT,
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate request body
    const { error, body } = await validateRequest(request, [
      "email",
      "password",
    ]);
    if (error) return error;

    const { email, password } = body;

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) return createErrorResponse(emailError);

    // Find doctor by email (case-insensitive)
    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (!doctor) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, doctor.password);
    if (!isPasswordValid) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = generateJWT(doctor._id);

    // Return success response with optimized doctor data
    return createSuccessResponse(
      {
        token,
        userData: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          role: "doctor",
          available: doctor.available,
          fees: doctor.fees,
          speciality: doctor.speciality,
          degree: doctor.degree,
          experience: doctor.experience,
          about: doctor.about,
          image: doctor.image,
        },
      },
      "Login successful"
    );
  } catch (error: any) {
    return handleDatabaseError(error, "Doctor login");
  }
}
