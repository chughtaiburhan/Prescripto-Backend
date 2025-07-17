import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { authAdmin } from "@/middleware/authAdmin";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authAdmin(request);
    if (authResult !== true) {
      return authResult; // Error response
    }

    // Get all doctors and their image URLs
    const doctors = await Doctor.find({}).select("name email image");

    const imageAnalysis = doctors.map((doctor) => ({
      name: doctor.name,
      email: doctor.email,
      image: doctor.image,
      hasImage: !!doctor.image,
      isBroken:
        doctor.image?.includes("via.placeholder.com") ||
        doctor.image?.includes("blob:") ||
        !doctor.image,
      imageType: typeof doctor.image,
    }));

    return NextResponse.json({
      success: true,
      totalDoctors: doctors.length,
      doctors: imageAnalysis,
      brokenImages: imageAnalysis.filter((d) => d.isBroken).length,
      workingImages: imageAnalysis.filter((d) => !d.isBroken).length,
    });
  } catch (error: any) {
    console.error("Check doctor images error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
