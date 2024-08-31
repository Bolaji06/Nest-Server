import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
})



/**
 * 
 * @param {String} receiver
 * @param {String} subject
 * @param {String} html 
 * @param {String} sender
 * @description Send email function 
 */

export async function sendEmail(receiver, subject, html, sender){
  try{
    const info = await transporter.sendMail({
      from: sender,
      to: receiver,
      subject: subject,
      html: html,
    })
    console.log("Message sent "+ info.messageId)
    
  }catch(err){
    console.log(err);
  }
}