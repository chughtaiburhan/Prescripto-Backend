// Simple email sending utility
// In production, replace this with actual Nodemailer or other email service

export const sendMail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> => {
  try {
    // In development, just log the email
    console.log("=== EMAIL SENT ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML:", html);
    if (text) console.log("Text:", text);
    console.log("==================");

    // In production, you would integrate with:
    // - Nodemailer with SMTP
    // - SendGrid
    // - AWS SES
    // - Resend
    // - etc.

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export default sendMail;
