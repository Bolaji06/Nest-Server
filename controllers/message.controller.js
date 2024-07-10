import prisma from "../lib/prisma.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function addMessage(req, res) {
  const body = req.body.text;
  const tokenId = req.user.id;
  const chatId = req.params.chatId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: {
          hasSome: [tokenId],
        },
      },
    });

    if (!chat) {
      res
        .status(401)
        .json({ success: false, message: "you don't have access to this chat" });
    }

    const message = await prisma.messages.create({
      data: {
        text: body,
        userId: tokenId,
        chatId: chatId,
      },
    });

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenId],
        lastMessage: body,
      },
    });

    res.status(200).json({ success: true, result: message });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}
