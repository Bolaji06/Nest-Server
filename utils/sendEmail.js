import nodemailer from "nodemailer";

export async function sendEmail({ email, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.HOST_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.HOST_EMAIL,
      to: email,
      subject: subject,
      html: html,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent " + info.response);
      }
    });
  } catch (err) {
    console.log("Fail to send email");
  }
}
