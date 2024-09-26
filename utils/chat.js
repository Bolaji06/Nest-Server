import prisma from "../lib/prisma.js";

/**
 *
 * @param {String} senderId
 * @param {String} receiverId
 * @param {String} text
 * @description find or create new chat if it does not exists
 */
export async function findOrCreateChat(senderId, receiverId, text) {
  try {
    const findChat = await prisma.chat.findFirst({
      where: {
        userIds: {
          hasEvery: [senderId, receiverId],
        },
      },
    });
    if (!findChat) {
      await prisma.chat.create({
        data: {
          userIds: [senderId, receiverId],
          messages: {
            create: {
              text,
              senderId,
            },
          },
        },
      });
    }

    const newMessage = await prisma.messages.create({
      data: {
        chatId: findChat.id,
        text,
        senderId,
        receiverId,
      },
    });
    return newMessage;
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
}
