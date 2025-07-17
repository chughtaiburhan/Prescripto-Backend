import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import VerificationCode from "@/models/VerificationCode"; // create this model
import User from "@/models/User"; // your user model
import sendEmail from "@/lib/sendEmail"; // implement a simple sendEmail function

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, action, code } = await req.json();

  if (!email || !action) {
    return NextResponse.json({ success: false, message: "Missing fields." }, { status: 400 });
  }

  if (action === "send") {
    // 1. Generate a 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save to DB (optional: with expiry)
    await VerificationCode.findOneAndUpdate(
      { email },
      { code: verificationCode, createdAt: new Date() },
      { upsert: true }
    );

    // 3. Send the email
    await sendEmail(email, `Your verification code is: ${verificationCode}`);

    return NextResponse.json({ success: true, message: "Code sent to email." });
  }

  if (action === "verify") {
    if (!code) return NextResponse.json({ success: false, message: "Verification code missing." }, { status: 400 });

    const entry = await VerificationCode.findOne({ email });
    if (!entry || entry.code !== code) {
      return NextResponse.json({ success: false, message: "Invalid or expired code." }, { status: 400 });
    }

    // If you want to now create the user:
    // You must pass registrationData from frontend separately

    return NextResponse.json({ success: true, message: "Email verified." });
  }

  return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
}