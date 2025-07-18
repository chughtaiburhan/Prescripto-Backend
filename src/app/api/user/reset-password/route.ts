import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User"; // your user model
import { hashPassword } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, action, code, newPassword } = await req.json();

  if (!email || !action) {
    return NextResponse.json(
      { success: false, message: "Missing fields." },
      { status: 400 }
    );
  }

  if (action === "send") {
    // This action is handled by the forgot-password endpoint
    return NextResponse.json(
      { success: false, message: "Use /api/user/forgot-password to send code." },
      { status: 400 }
    );
  }

  if (action === "verify") {
    if (!code)
      return NextResponse.json(
        { success: false, message: "Verification code missing." },
        { status: 400 }
      );

    const user = await User.findOne({ email });
    if (!user || user.resetCode !== code) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired code." },
        { status: 400 }
      );
    }

    // Password reset logic
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 8 characters.",
          },
          { status: 400 }
        );
      }
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword, resetCode: null },
        { new: true }
      );
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "User not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Password reset successful.",
      });
    }

    return NextResponse.json({ success: true, message: "Email verified." });
  }

  return NextResponse.json(
    { success: false, message: "Invalid action." },
    { status: 400 }
  );
}
