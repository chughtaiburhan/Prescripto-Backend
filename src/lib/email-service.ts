// Simple email service for sending verification codes
// In production, you would use services like SendGrid, AWS SES, or Nodemailer

import { sendMail } from "./nodemailer"; // Assuming nodemailer.ts is in the same directory or adjust path

export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendVerificationEmail(
    email: string,
    verificationCode: string
  ): Promise<boolean> {
    const emailConfig: EmailConfig = {
      to: email,
      subject: "Prescripto: Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5f6FFF 0%, #4a5aee 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Prescripto Email Verification</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fd;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with Prescripto. Please use the following verification code to complete your registration:
            </p>
            
            <div style="background: #e0e0e0; border-radius: 10px; padding: 15px 20px; margin: 20px 0; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">${verificationCode}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code is valid for a limited time. If you did not request this, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Prescripto. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      if (this.isProduction) {
        await sendMail(emailConfig.to, emailConfig.subject, emailConfig.html);
        console.log("Production verification email sent successfully.");
        return true;
      } else {
        console.log("=== DEVELOPMENT VERIFICATION EMAIL ===");
        console.log("To:", emailConfig.to);
        console.log("Subject:", emailConfig.subject);
        console.log("Verification Code:", verificationCode);
        // In development, you might still want to actually send the email for testing
        await sendMail(emailConfig.to, emailConfig.subject, emailConfig.html);
        console.log("Development verification email sent successfully.");
        return true;
      }
    } catch (error) {
      console.error("Verification email sending failed:", error);
      return false;
    }
  }

  public async sendWelcomeEmail(
    email: string,
    name: string,
    role: string
  ): Promise<boolean> {
    const emailConfig: EmailConfig = {
      to: email,
      subject: "Welcome to Prescripto!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5f6FFF 0%, #4a5aee 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Prescripto!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fd;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Prescripto! Your account has been successfully created as a ${role}.
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #5f6FFF; margin-top: 0;">What's Next?</h3>
              ${
                role === "doctor"
                  ? '<p style="color: #666;">You can now access the admin panel to manage appointments and patient information.</p>'
                  : '<p style="color: #666;">You can now book appointments with our qualified doctors and manage your health records.</p>'
              }
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173" style="background: #5f6FFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit Prescripto
              </a>
            </div>
          </div>
        </div>
      `,
    };

    try {
      if (this.isProduction) {
        await sendMail(emailConfig.to, emailConfig.subject, emailConfig.html);
        console.log("Production welcome email sent successfully.");
        return true;
      } else {
        console.log("=== DEVELOPMENT WELCOME EMAIL ===");
        console.log("To:", emailConfig.to);
        console.log("Subject:", emailConfig.subject);
        await sendMail(emailConfig.to, emailConfig.subject, emailConfig.html); // Also send in development for full testing
        console.log("Development welcome email sent successfully.");
        return true;
      }
    } catch (error) {
      console.error("Welcome email sending failed:", error);
      return false;
    }
  }
}

export default EmailService;