import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export const authAdmin = async (request: NextRequest) => {
  try {
    await dbConnect();
    const atoken = request.headers.get("atoken");
    if (!atoken) {
      return NextResponse.json(
        { success: false, message: "Not Authorized Login Again" },
        { status: 401 }
      );
    }
    const jwtSecret =
      process.env.JWT_SECRET || "fallback_secret_key_for_development_only";
    const decoded: any = jwt.verify(atoken, jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Not Authorized Login Again" },
        { status: 401 }
      );
    }
    return true;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
};
