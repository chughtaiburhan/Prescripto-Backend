import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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

  return NextResponse.json({ message: "Email verified successfully." });
}
