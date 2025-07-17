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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create user with optimized data structure
    const userData = {
      ...sanitizedData,
      password: hashedPassword,
      role: role || "patient",
      verificationCode,
      isVerified: false,
    };

    // Create user using reusable service
    const user = await UserService.createUser(userData);

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
      return createErrorResponse(
        "Failed to send verification email. Please try again."
      );
    }

    // Do NOT generate token here
    return createSuccessResponse(
      {
        email: sanitizedData.email, // Optionally return email for frontend state
      },
      "Registration successful. Please check your email for verification."
    );
  }, "User registration");
}
