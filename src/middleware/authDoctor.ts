import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const authDoctor = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not Authorized. Please log in again." },
        { status: 401 }
      );
    }

    const jwtSecret =
      process.env.JWT_SECRET || "fallback_secret_key_for_development_only";
    const token_decode = jwt.verify(token, jwtSecret) as any;
    return token_decode.id;
  } catch (error: any) {
    console.error("Auth Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
};
