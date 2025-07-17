import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendMail } from "@/lib/mailutils";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "Email not found" }, { status: 404 });

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  await user.save();

  await sendMail(
    email,
    "Reset your password",
    `<p>Code: <b>${resetCode}</b></p>`
  );

  return NextResponse.json({ message: "Reset code sent to your email." });
}
