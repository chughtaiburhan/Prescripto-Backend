import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authUser } from "@/middleware/authUser";
import {
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
} from "@/lib/api-utils";

// Force dynamic rendering since this route uses request.headers
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const userId = await authUser(request);
    if (typeof userId === "object") {
      return userId; // Error response
    }

    // Optimized query with specific field selection
    const userData = await User.findById(userId)
      .select("-password -verificationCode -resetCode")
      .lean(); // Use lean() for better performance

    if (!userData) {
      return createErrorResponse("User not found", 404);
    }

    return createSuccessResponse({ userData });
  } catch (error: any) {
    return handleDatabaseError(error, "Get user profile");
  }
}
