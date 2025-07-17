export default async function sendEmail(email: string, message: string) {
  // In production, integrate with a real email service
  console.log(`Sending email to ${email}: ${message}`);
  return true;
}
