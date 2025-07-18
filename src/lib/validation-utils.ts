import { NextRequest } from "next/server";
import validator from "validator";

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// Request validation
export const validateRequest = async (
  request: NextRequest,
  rules: ValidationRule[]
): Promise<{ isValid: boolean; errors: string[]; data: any }> => {
  try {
    const body = await request.json();
    const errors: string[] = [];

    rules.forEach((rule) => {
      const value = body[rule.field];
      const error = validateField(value, rule);
      if (error) errors.push(error);
    });

    return {
      isValid: errors.length === 0,
      errors,
      data: body,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ["Invalid JSON in request body"],
      data: null,
    };
  }
};

// Field validation
export const validateField = (
  value: any,
  rule: ValidationRule
): string | null => {
  // Required field validation
  if (rule.required && (!value || value.toString().trim() === "")) {
    return `${rule.field} is required`;
  }

  if (!value && !rule.required) return null;

  // Type validation
  if (rule.type) {
    const typeError = validateType(value, rule.type);
    if (typeError) return typeError;
  }

  // Length validation
  if (rule.minLength && value.toString().length < rule.minLength) {
    return `${rule.field} must be at least ${rule.minLength} characters`;
  }

  if (rule.maxLength && value.toString().length > rule.maxLength) {
    return `${rule.field} must be at most ${rule.maxLength} characters`;
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value.toString())) {
    return `${rule.field} format is invalid`;
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) return customError;
  }

  return null;
};

// Type validation
export const validateType = (value: any, type: string): string | null => {
  switch (type) {
    case "email":
      return validator.isEmail(value) ? null : "Invalid email format";
    case "phone":
      return validator.isMobilePhone(value) ? null : "Invalid phone number";
    case "url":
      return validator.isURL(value) ? null : "Invalid URL format";
    case "date":
      return !isNaN(Date.parse(value)) ? null : "Invalid date format";
    case "number":
      return !isNaN(Number(value)) ? null : "Must be a number";
    case "boolean":
      return typeof value === "boolean" ||
        ["true", "false", "0", "1"].includes(value)
        ? null
        : "Must be a boolean";
    default:
      return null;
  }
};

// Common validation rules
export const commonValidationRules = {
  email: {
    field: "email",
    required: true,
    type: "email",
    maxLength: 255,
  },
  password: {
    field: "password",
    required: true,
    minLength: 6,
    maxLength: 128,
  },
  name: {
    field: "name",
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
  },
  phone: {
    field: "phone",
    required: false,
    type: "phone",
  },
  age: {
    field: "age",
    required: false,
    type: "number",
    custom: (value: number) => {
      if (value < 0 || value > 150) return "Age must be between 0 and 150";
      return null;
    },
  },
};

// Business-specific validations
export const appointmentValidation = {
  slotDate: {
    field: "slotDate",
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0);
      if (date < today) return "Appointment date cannot be in the past";
      return null;
    },
  },
  slotTime: {
    field: "slotTime",
    required: true,
    pattern: /^([01]?[0-9]|2[0-3][0-5][0-9])$/,
  },
  docId: {
    field: "docId",
    required: true,
    pattern: /^[0-9a-fA-F]{24}$/,
  },
};

export const doctorValidation = {
  speciality: {
    field: "speciality",
    required: true,
    custom: (value: string) => {
      const validSpecialities = [
        "General Physician",
        "Gynecologist",
        "Dermatologist",
        "Pediatrician",
        "Neurologist",
        "Gastroenterologist",
        "Cardiologist",
        "Orthopedist",
        "Psychiatrist",
        "Ophthalmologist",
      ];
      if (!validSpecialities.includes(value))
        return `Speciality must be one of: ${validSpecialities.join(", ")}`;
      return null;
    },
  },
  fees: {
    field: "fees",
    required: false,
    type: "number",
    custom: (value: number) => {
      if (value < 0 || value > 100) return "Fees must be between 0 and 100";
      return null;
    },
  },
  experience: {
    field: "experience",
    required: false,
    pattern: /^\d+\s*(years?|yrs?)$/i,
  },
};

// Utility validation functions (robust versions)
export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!validator.isEmail(email)) return "Invalid email format";
  if (email.length > 255) return "Email too long";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 128) return "Password too long";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Optional field
  if (!validator.isMobilePhone(phone)) return "Invalid phone number";
  return null;
};

export const validateObjectId = (id: string): string | null => {
  if (!id) return "ID is required";
  if (!validator.isMongoId(id)) return "Invalid ID format";
  return null;
};

export const validateDate = (date: string): string | null => {
  if (!date) return "Date is required";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "Invalid date format";
  return null;
};

// Sanitization functions (keep only one version)
export const sanitizeString = (str: string): string => {
  if (!str) return "";
  return validator.escape(str.trim());
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return "";
  return email.trim().toLowerCase();
};

export const sanitizePhone = (phone: string): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

// Validation helpers for specific use cases
export const validateAppointmentSlot = (
  slotDate: string,
  slotTime: string
): string | null => {
  const dateError = validateDate(slotDate);
  if (dateError) return dateError;

  // Basic time validation - check if it's a valid time format
  if (!slotTime || typeof slotTime !== "string") {
    return "Time is required";
  }

  // Simple time format check (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(slotTime)) {
    return "Invalid time format. Use HH:MM format (e.g., 09:30, 14:45)";
  }

  // Check if slot is in the future
  const appointmentDateTime = new Date(`${slotDate}T${slotTime}`);
  const now = new Date();
  if (appointmentDateTime <= now) {
    return "Appointment slot must be in the future";
  }
  return null;
};

export const validateUserRegistration = async (request: NextRequest) => {
  const rules = [
    commonValidationRules.name,
    commonValidationRules.email,
    commonValidationRules.password,
    commonValidationRules.phone,
  ];
  return await validateRequest(request, rules);
};

export const validateDoctorRegistration = async (request: NextRequest) => {
  const rules = [
    commonValidationRules.name,
    commonValidationRules.email,
    commonValidationRules.password,
    doctorValidation.speciality,
    doctorValidation.fees,
    doctorValidation.experience,
  ];
  return await validateRequest(request, rules);
};

export const validateAppointmentBooking = async (request: NextRequest) => {
  const rules = [
    appointmentValidation.docId,
    appointmentValidation.slotDate,
    appointmentValidation.slotTime,
  ];
  return await validateRequest(request, rules);
};

// Simple boolean/length validators for UI (not used in backend logic)
export const validateEmailSimple = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneSimple = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const validatePasswordSimple = (password: string): boolean => {
  return Boolean(password && password.length >= 6);
};

export const validateName = (name: string): boolean => {
  return Boolean(name && name.trim().length >= 2);
};
