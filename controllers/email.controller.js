import prisma from "../lib/prisma.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendListingEmail } from "../utils/welcomeEmail.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function shareListingEmail(req, res) {
  const { to, from, message, postId } = req.body;

  const subject = "Checkout this listing on Nest";

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (post) {
      const postImage = post.images[0];

      
      const id = post.id

      const html = sendListingEmail(postImage, id, from, to, message, post);
      const shareEmail = await sendEmail(to, subject, html, from );
      if (!shareEmail){
        return res.status(400).json({ success: false, message: 'Fail to send email'});
      }
      return res.status(200).json({ success: true, message: shareEmail });
     
      
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}
