import { NextRequest } from "next/server";

// Performance monitoring
export const measurePerformance = (operation: string) => {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${operation} completed in ${duration}ms`);
    return duration;
  };
};

// Request logging
export const logRequest = (request: NextRequest, operation: string) => {
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get("user-agent") || "Unknown";

  console.log(`📝 ${method} ${url} - ${operation} - User-Agent: ${userAgent}`);
};

// Database query optimization helpers
export const optimizeQuery = {
  // Limit results for pagination
  paginate: (page: number = 1, limit: number = 10) => ({
    skip: (page - 1) * limit,
    limit,
  }),

  // Sort options
  sort: {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name: { name: 1 },
    email: { email: 1 },
  },

  // Common field selections
  select: {
    user: "-password -verificationCode -resetCode",
    doctor: "-password",
    appointment: "userId docId slotDate slotTime amount cancelled payment",
  },
};

// Cache helpers (for future Redis implementation)
export const cacheKeys = {
  doctors: "doctors:list",
  appointments: "appointments:user:",
  userProfile: "user:profile:",
  doctorProfile: "doctor:profile:",
};

// Rate limiting helpers (for future implementation)
export const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};
