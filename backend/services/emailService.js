import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, verificationUrl) => {
  await transport.sendMail({
    from: `"Contacts App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    text: `Click the link to verify your email: ${verificationUrl}`,
    html: `<p>Click the link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
};
