// File: /api/user/verify-email.ts
import { NextRequest, NextResponse } from "next/server";
import { tempUserStore } from "../register/route"; // import from temp store
import { hashPassword, generateJWT } from "@/lib/api-utils";
import { UserService } from "@/lib/database-utils";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, code } = await req.json();

  const tempUser = tempUserStore.get(email);
  if (!tempUser || tempUser.verificationCode !== code) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await hashPassword(tempUser.password);

  // Final user data
  const userData = {
    ...tempUser,
    password: hashedPassword,
    isVerified: true,
  };

  // Save user to DB
  const newUser = await UserService.createUser(userData);

  // Clear temp store
  tempUserStore.delete(email);

  // Generate token
  const token = generateJWT(newUser._id);

  return NextResponse.json({
    message: "Email verified successfully.",
    token,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
    },
  });
}
