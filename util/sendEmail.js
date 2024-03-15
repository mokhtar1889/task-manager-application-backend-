import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Node.jsCourse" <${process.env.USER_EMAIL}>`,
    to,
    subject,
    html,
  });
  // console.log(info);

  if (info.accepted.length > 0) return true;
  return false;
}
