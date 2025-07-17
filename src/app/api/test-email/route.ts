import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailutils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    console.log("=== EMAIL TEST START ===");
    console.log("Testing email sending to:", email);
    console.log("Using MAIL_USER:", process.env.MAIL_USER || "burhanchughtai90@gmail.com");
    console.log("Using MAIL_PASS:", process.env.MAIL_PASS ? "***SET***" : "***NOT SET***");
    
    const result = await sendMail(
      email,
      "Test Email from Prescripto",
      "This is a test email to verify email sending is working. Time: " + new Date().toISOString()
    );
    
    console.log("Email send result:", result);
    console.log("=== EMAIL TEST END ===");
    
    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully!",
      email: email,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("=== EMAIL TEST FAILED ===");
    console.error("Test email failed:", error);
    console.error("Error details:", error.message);
    console.error("=== EMAIL TEST FAILED END ===");
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
} 