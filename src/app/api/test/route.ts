import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    return NextResponse.json({
      success: true,
      message: "Next.js Backend API is working!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      features: {
        roleSupport: true,
        userRegistration: true,
        doctorRegistration: true,
        patientRegistration: true,
        adminPanel: true,
        corsEnabled: true,
        imageUpload: true,
        cloudinary: !!process.env.CLOUDINARY_NAME,
        emailVerification: false, // Simplified - no email verification
        simplifiedAuth: true,
      },
      env: {
        hasCloudinary: !!process.env.CLOUDINARY_NAME,
        hasJWTSecret: !!process.env.JWT_SECRET,
        hasMongoURI: !!process.env.mongoatlasURI,
        usingFallbackJWT: !process.env.JWT_SECRET,
        usingFallbackMongo: !process.env.mongoatlasURI,
      },
      status: "Ready for simplified registration",
    });
  } catch (error: any) {
    console.error("Test route error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: "Test POST request received",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Test POST error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
