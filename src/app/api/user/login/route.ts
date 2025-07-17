import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = generateJWT(user._id);

    // Return success response with optimized user data
    return createSuccessResponse(
      {
        token,
        userData: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          image: user.image,
          phone: user.phone,
          address: user.address,
          gender: user.gender,
          dob: user.dob,
        },
      },
      "Login successful"
    );
  } catch (error: any) {
    return handleDatabaseError(error, "User login");
  }
}
