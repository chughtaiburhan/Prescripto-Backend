import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// @ts-ignore
import validator from "validator";

// Constants
export const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_for_development_only";
export const JWT_EXPIRES_IN = "7d";
export const BCRYPT_ROUNDS = 10;

// Response helpers
export const createSuccessResponse = (data: any, message?: string) => {
  return NextResponse.json({
    success: true,
    message,
    ...data,
  });
};

export const createErrorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};

export const createServerErrorResponse = (error: any) => {
  console.error("Server Error:", error);
  return NextResponse.json(
    {
      success: false,
      message: "Server error",
    },
    { status: 500 }
  );
};

// Validation helpers
export const validateRequiredFields = (body: any, requiredFields: string[]) => {
  const missingFields = requiredFields.filter((field) => !body[field]);
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }
  return null;
};

export const validateEmail = (email: string) => {
  if (!validator.isEmail(email)) {
    return "Enter a valid email";
  }
  return null;
};

export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
};

export const validatePhone = (phone: string) => {
  if (phone && !validator.isMobilePhone(phone)) {
    return "Enter a valid phone number";
  }
  return null;
};

// Authentication helpers
export const generateJWT = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Database helpers
export const handleDatabaseError = (error: any, operation: string) => {
  console.error(`${operation} error:`, error);

  if (error.code === 11000) {
    return createErrorResponse("Email already registered", 409);
  }

  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err: any) => err.message
    );
    return createErrorResponse(validationErrors.join(", "), 400);
  }

  return createServerErrorResponse(error);
};

// Appointment helpers
export const formatSlotDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}_${month}_${year}`;
};

export const createAppointmentData = (
  userId: string,
  docId: string,
  slotDate: string,
  slotTime: string,
  amount: number
) => {
  return {
    userId,
    docId,
    slotDate,
    slotTime,
    amount,
    date: new Date().toString(),
    docDate: new Date().toISOString(),
    userDate: new Date().toISOString(),
    cancelled: false,
    payment: "pending",
    isCompleted: false,
  };
};

// Doctor helpers
export const createDoctorDefaults = () => {
  return {
    available: true,
    fees: 100,
    speciality: "General Physician",
    degree: "MBBS",
    experience: "5 years",
    about: "Experienced doctor with expertise in various medical conditions.",
    image: "",
    address: "",
    slot_booked: {},
  };
};

// Rate limiting and caching helpers (for future use)
export const createCacheKey = (prefix: string, identifier: string) => {
  return `${prefix}:${identifier}`;
};

// Request validation wrapper
export const validateRequest = async (
  request: NextRequest,
  requiredFields: string[]
) => {
  try {
    const body = await request.json();
    const missingFieldsError = validateRequiredFields(body, requiredFields);

    if (missingFieldsError) {
      return {
        error: createErrorResponse(missingFieldsError, 400),
        body: null,
      };
    }

    return { error: null, body };
  } catch (error) {
    return {
      error: createErrorResponse("Invalid JSON in request body", 400),
      body: null,
    };
  }
};
