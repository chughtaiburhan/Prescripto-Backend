import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateJWT } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, code } = await req.json();

  const user = await User.findOne({ email });
  if (!user || user.verificationCode !== code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  await user.save();

  // Generate JWT token
  const token = generateJWT(user._id);

  // Return user data and token
  return NextResponse.json({
    message: "Email verified successfully.",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // ...add any other fields you want to return
    },
  });
}
