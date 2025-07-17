// File: /api/user/register.ts
import { NextRequest } from "next/server";
import { sendMail } from "@/lib/mailutils";
import {
  validateUserRegistration,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  validateEmail,
  validatePassword,
  validatePhone,
} from "@/lib/validation-utils";
import {
  createSuccessResponse,
  createErrorResponse,
  createConflictResponse,
  withErrorHandling,
  formatUserData,
} from "@/lib/response-utils";
import { UserService } from "@/lib/database-utils";
import { hashPassword, generateJWT } from "@/lib/api-utils";

// Temporary store for unverified users
export const tempUserStore = new Map();

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Validate request using reusable validation
    const { isValid, errors, data } = await validateUserRegistration(request);

    if (!isValid) {
      return createErrorResponse("Validation failed", 400, {
        validationErrors: errors,
      });
    }

    const { name, email, password, role, phone, address, gender, dob, image } =
      data;

    // Sanitize input data
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeEmail(email),
      phone: phone ? sanitizePhone(phone) : "000000",
      address: address || { line: "", line2: "" },
      gender: gender || "Not Selected",
      dob: dob || "Not Selected",
      image: image || "",
    };

    // Check if user already exists using reusable service
    const existingUser = await UserService.findByEmail(sanitizedData.email);
    if (existingUser) {
      return createConflictResponse("User with this email already exists");
    }

    // Generate verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Store user data temporarily (NOT in DB yet)
    const tempUserData = {
      ...sanitizedData,
      password: password, // Store plain password temporarily
      role: role || "patient",
      verificationCode,
      isVerified: false,
    };

    // Store in temporary store
    tempUserStore.set(sanitizedData.email, tempUserData);

    // Send verification email
    try {
      await sendMail(
        sanitizedData.email,
        "Prescripto: Email Verification",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5f6FFF 0%, #4a5aee 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Prescripto Email Verification</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fd;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${
              sanitizedData.name
            },</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with Prescripto. Please use the following verification code to complete your registration:
            </p>
            
            <div style="background: #e0e0e0; border-radius: 10px; padding: 15px 20px; margin: 20px 0; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">${verificationCode}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code is valid for a limited time. If you did not request this, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Prescripto. All rights reserved.</p>
            </div>
          </div>
        </div>
        `
      );
      console.log(`Verification email sent to ${sanitizedData.email}`);
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      // Clean up temp store if email fails
      tempUserStore.delete(sanitizedData.email);
      return createErrorResponse(
        "Failed to send verification email. Please try again."
      );
    }

    // Return success response with email only (NO token, NO user data)
    return createSuccessResponse(
      {
        email: sanitizedData.email,
      },
      "OTP code sent to your email. Please verify to complete registration."
    );
  }, "User registration");
}
