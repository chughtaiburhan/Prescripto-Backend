import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
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

    // Find admin by email (case-insensitive)
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = generateJWT(admin._id);

    // Return success response with optimized admin data
    return createSuccessResponse(
      {
        token,
        adminData: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      "Login successful"
    );
  } catch (error: any) {
    return handleDatabaseError(error, "Admin login");
  }
}
