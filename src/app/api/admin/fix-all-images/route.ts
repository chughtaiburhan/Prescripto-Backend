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

    // Find all doctors
    const doctors = await Doctor.find({});
    let updatedCount = 0;
    let skippedCount = 0;
    const updates = [];

    for (const doctor of doctors) {
      // Check if the image URL needs to be fixed
      const needsUpdate =
        !doctor.image ||
        doctor.image.includes("via.placeholder.com") ||
        doctor.image.includes("blob:") ||
        doctor.image === "" ||
        doctor.image.includes("localhost:5173");

      if (needsUpdate) {
        // Generate a new image URL with the doctor's name
        const newImageUrl = getFallbackDoctorImage(doctor.name);

        // Update the doctor's image
        await Doctor.findByIdAndUpdate(doctor._id, {
          image: newImageUrl,
        });

        updates.push({
          name: doctor.name,
          oldImage: doctor.image,
          newImage: newImageUrl,
        });

        updatedCount++;
        console.log(`Updated image for doctor: ${doctor.name}`);
        console.log(`  Old: ${doctor.image}`);
        console.log(`  New: ${newImageUrl}`);
      } else {
        skippedCount++;
        console.log(`Skipped doctor: ${doctor.name} (image looks good)`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updatedCount} doctor images, skipped ${skippedCount}`,
      totalDoctors: doctors.length,
      updatedCount,
      skippedCount,
      updates,
    });
  } catch (error: any) {
    console.error("Fix all images error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
