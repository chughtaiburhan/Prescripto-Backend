// File: /api/user/verify-email.ts
import { NextRequest, NextResponse } from "next/server";
import { generateJWT } from "@/lib/api-utils";
import { UserService } from "@/lib/database-utils";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, code } = await req.json();

  console.log("Verification attempt:", { email, code });

  // Find user by email
  const user = await UserService.findByEmail(email);

  if (!user) {
    return NextResponse.json(
      { error: "No registration found for this email. Please register again." },
      { status: 400 }
    );
  }

  console.log("Found user:", user.email, "isVerified:", user.isVerified);
  console.log("Stored verification code:", user.verificationCode);
  console.log("Provided code:", code);
  console.log("Codes match:", user.verificationCode === code);

  if (user.isVerified) {
    return NextResponse.json(
      { error: "Email is already verified." },
      { status: 400 }
    );
  }

  if (user.verificationCode !== code) {
    return NextResponse.json(
      {
        error: `Invalid code. Expected: ${user.verificationCode}, Got: ${code}`,
      },
      { status: 400 }
    );
  }

  // Update user to verified
  const updatedUser = await UserService.updateUserProfile(user._id, {
    isVerified: true,
    verificationCode: undefined, // Clear the code
  });

  // Generate JWT token for the verified user
  const token = generateJWT(updatedUser._id);

  return NextResponse.json({
    message: "Email verified successfully.",
    token,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      image: updatedUser.image,
      isVerified: updatedUser.isVerified,
    },
  });
}
