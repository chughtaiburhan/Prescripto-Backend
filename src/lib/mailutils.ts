import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER! || "burhanchughtai90@gmail.com",
    pass: process.env.MAIL_PASS! || "voek roox xtgp kgnp",
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Prescripto" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("Error sending mail:", err);
    throw err;
  }
};
