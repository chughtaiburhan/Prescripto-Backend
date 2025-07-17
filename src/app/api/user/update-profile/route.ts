import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authUser } from "@/middleware/authUser";
import { uploadImage } from "@/lib/image-utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await authUser(request);
    if (typeof userId === "object") {
      return userId; // Error response
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const dob = formData.get("dob") as string;
    const gender = formData.get("gender") as string;
    const addressRaw = formData.get("address") as string;
    const imageFile = formData.get("image") as File | null;

    let address = {};
    try {
      address = addressRaw ? JSON.parse(addressRaw) : {};
    } catch {
      address = {};
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (address) user.address = address;

    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      try {
        const imageUrl = await uploadImage(imageFile);
        user.image = imageUrl;
      } catch (err) {
        // Ignore image upload error, keep old image
      }
    }

    await user.save();
    const updatedUser = await User.findById(userId).select("-password");
    return NextResponse.json({ success: true, userData: updatedUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
