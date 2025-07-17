import { NextRequest, NextResponse } from next/server";

// Standard response patterns
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
  timestamp?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Success Response Helpers
export const createSuccessResponse = <T>(
  data: T,
  message: string = "Success",
  status: number = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

export const createPaginatedResponse = <T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  message: string = "Data retrieved successfully"
): NextResponse<ApiResponse<T[]>> => {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
};

// Error Response Helpers
export const createErrorResponse = (
  message: string,
  status: number = 400,
  error?: any
): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

export const createValidationErrorResponse = (
  errors: string[]
): NextResponse<ApiResponse> => {
  return createErrorResponse("Validation failed", 400, { validationErrors: errors });
};

export const createNotFoundResponse = (
  resource: string = "Resource"
): NextResponse<ApiResponse> => {
  return createErrorResponse(`${resource} not found`, 404);
};

export const createUnauthorizedResponse = (
  message: string = "Unauthorized access"
): NextResponse<ApiResponse> => {
  return createErrorResponse(message, 401);
};

export const createForbiddenResponse = (
  message: string = "Access forbidden"
): NextResponse<ApiResponse> => {
  return createErrorResponse(message, 403);
};

export const createConflictResponse = (
  message: string = "Resource conflict"
): NextResponse<ApiResponse> => {
  return createErrorResponse(message, 409);
};

export const createServerErrorResponse = (
  error?: any,
  message: string = "Internal server error"
): NextResponse<ApiResponse> => {
  console.error("Server Error:", error);
  return createErrorResponse(message, 500);
};

// Data Formatting Helpers
export const formatUserData = (user: any) => {
  const { password, verificationCode, resetCode, ...userData } = user;
  return userData;
};

export const formatDoctorData = (doctor: any) => {
  const { password, ...doctorData } = doctor;
  return doctorData;
};

export const formatAppointmentData = (appointment: any) => {
  return {
    _id: appointment._id,
    slotDate: appointment.slotDate,
    slotTime: appointment.slotTime,
    amount: appointment.amount,
    payment: appointment.payment,
    cancelled: appointment.cancelled,
    isCompleted: appointment.isCompleted,
    createdAt: appointment.createdAt,
    user: appointment.userId,
    doctor: appointment.docId,
  };
};

// Pagination Helpers
export const getPaginationParams = (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Max 10 items per page
    skip: (page - 1) * limit,
  };
};

// Query Building Helpers
export const buildSearchQuery = (searchTerm: string, fields: string[]) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, "i");
  const searchConditions = fields.map(field => ({
    [field]: searchRegex,
  }));
  
  return { $or: searchConditions };
};

export const buildFilterQuery = (filters: Record<string, any>) => {
  const query: Record<string, any> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "string" && value.includes(",")) {
        // Handle array values (e.g., "value1,2,3")
        query[key] = { $in: value.split(",") };
      } else {
        query[key] = value;
      }
    }
  });
  
  return query;
};

export const buildSortQuery = (sortBy: string = "createdAt", sortOrder: string = "desc") => {
  const order = sortOrder === "asc" ? 1 : -1;
  return { [sortBy]: order };
};

// Response Wrapper for Async Operations
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string = "Operation"
): Promise<NextResponse<ApiResponse<T>>> => {
  try {
    const result = await operation();
    return createSuccessResponse(result, `${operationName} completed successfully`);
  } catch (error: any) {
    console.error(`${operationName} error:`, error);
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return createValidationErrorResponse(validationErrors);
    }
    
    if (error.code === 11000) {
      return createConflictResponse("Duplicate entry found");
    }
    
    return createServerErrorResponse(error);
  }
};

// Rate Limiting Helper (Basic)
export const createRateLimitKey = (identifier: string, action: string) => {
  return `${identifier}:${action}:${Math.floor(Date.now() / 60000)}`; // 1 minute window
};

// Cache Helper
export const createCacheKey = (prefix: string, params: Record<string, any>) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(":");
  return `${prefix}:${sortedParams}`;
}; 