// File: /api/user/register.ts
import { NextRequest } from "next/server";
import { sendMail } from "@/lib/mailutils";
import {
  validateUserRegistration,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
} from "@/lib/validation-utils";
import {
  createSuccessResponse,
  createErrorResponse,
  createConflictResponse,
  withErrorHandling,
} from "@/lib/response-utils";
import { UserService } from "@/lib/database-utils";

// In-memory or temp-store DB like Redis should be used in production
const tempUserStore = new Map();

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { isValid, errors, data } = await validateUserRegistration(request);

    if (!isValid) {
      return createErrorResponse("Validation failed", 400, {
        validationErrors: errors,
      });
    }

    const { name, email, password, role, phone, address, gender, dob, image } = data;

    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeEmail(email),
      phone: phone ? sanitizePhone(phone) : "000000",
      address: address || { line: "", line2: "" },
      gender: gender || "Not Selected",
      dob: dob || "Not Selected",
      image: image || "",
      password,
      role: role || "patient",
    };

    const existingUser = await UserService.findByEmail(sanitizedData.email);
    if (existingUser) {
      return createConflictResponse("User with this email already exists");
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Save user temporarily
    tempUserStore.set(sanitizedData.email, {
      ...sanitizedData,
      verificationCode,
    });

    // Send email
    try {
      await sendMail(
        sanitizedData.email,
        "Prescripto: Email Verification",
        `<p>Hello ${sanitizedData.name},</p>
         <p>Your OTP is: <strong>${verificationCode}</strong></p>`
      );
    } catch (err) {
      return createErrorResponse("Failed to send verification email.", 500);
    }

    return createSuccessResponse(
      { email: sanitizedData.email },
      "OTP code has been sent to your email."
    );
  }, "User registration");
}

export { tempUserStore }; // for access in verify
