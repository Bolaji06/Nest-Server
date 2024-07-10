import prisma from "../lib/prisma.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @description gets all user's chat
 */
export async function getChats(req, res) {
  const tokenId = req.user.id;

  const chats = await prisma.chat.findMany({
    where: {
      userId: {
        hasSome: [tokenId],
      },
    },
  });

  for (let chat of chats){
    const receiverId = chat.userId.find((id) => id !== tokenId);

    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId
      },
      select: {
        id: true,
        username: true,
        avatar: true,
      }
    })
    chat.receiver = receiver;
  }

  
  res.status(200).json({ success: true, result: chats });
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @description get user's chat
 */
export async function getChat(req, res) {
  const id = req.params.id;
  const tokenId = req.user.id;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: id,
        AND: {
          userId: {
            hasSome: [tokenId],
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "chat not found" });
    }

    // to avoid resetting chat each time a chat is retrieved
    const seenChat = [...new Set([...chat.seenBy, tokenId])];

    await prisma.chat.update({
      where: {
        id: id,
      },
      data: {
        seenBy: {
          // we could use push but push keep adding new tokenId to the seenBy array
          set: seenChat,
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @description add user's chat
 */
export async function addChat(req, res) {
  const tokenId = req.user.id;

  try {
    const newChat = await prisma.chat.create({
      data: {
        userId: [tokenId, req.body.receiverId],
      },
    });
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @description read users chat
 *
 */
export async function readChat(req, res) {
  const id = req.params.id;
  const tokenId = req.user.id;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: id,
      },
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "cannot find chat" });
    }

    const setReadChat = [...new Set([...chat.seenBy, tokenId])];

    const readChat = await prisma.chat.update({
      where: {
        id: id,
        userId: {
          hasSome: [tokenId],
        },
      },
      data: {
        seenBy: {
          set: setReadChat,
        },
      },
    });
    res.status(200).json(readChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, success: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteChat(req, res) {
  const chatId = req.params.chatId;
  const tokenId = req.user.id;

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
        .status(403)
        .json({ success: false, message: "you can't delete this chat" });
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    res.status(200).json({ success: true, message: "chat deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}
//addChat
//readChat
//deleteChat
