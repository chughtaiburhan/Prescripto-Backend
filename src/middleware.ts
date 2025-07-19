import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "https://prescripto-frontend-ten.vercel.app",
  "https://prescripto-frontend-ecru.vercel.app",
  "http://localhost:5173",
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = allowedOrigins.includes(origin || "")
    ? origin
    : allowedOrigins[0];

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin || allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, atoken",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set(
    "Access-Control-Allow-Origin",
    allowedOrigin || allowedOrigins[0]
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, atoken"
  );
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
