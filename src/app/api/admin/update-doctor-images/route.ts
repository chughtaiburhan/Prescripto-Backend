import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { authAdmin } from "@/middleware/authAdmin";
import { getFallbackDoctorImage } from "@/lib/image-utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authAdmin(request);
    if (authResult !== true) {
      return authResult; // Error response
    }

    // Find all doctors with broken image URLs
    const doctors = await Doctor.find({});
    let updatedCount = 0;

    for (const doctor of doctors) {
      // Check if the image URL is broken (contains via.placeholder.com or is empty)
      if (!doctor.image || 
          doctor.image.includes('via.placeholder.com') || 
          doctor.image.includes('blob:') ||
          doctor.image === '') {
        
        // Generate a new image URL with the doctor's name
        const newImageUrl = getFallbackDoctorImage(doctor.name);
        
        // Update the doctor's image
        await Doctor.findByIdAndUpdate(doctor._id, {
          image: newImageUrl
        });
        
        updatedCount++;
        console.log(`Updated image for doctor: ${doctor.name} -> ${newImageUrl}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} doctor images`,
      updatedCount
    });

  } catch (error: any) {
    console.error("Update doctor images error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
} 