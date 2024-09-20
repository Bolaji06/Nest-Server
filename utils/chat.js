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
      },
    });
    return newMessage;
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
}

/**
 * 
 * @param {String} chatId 
 * @returns object
 * @description get all messages from a chat
 */
export async function getAllMessages(chatId) {
    try{
        const messages = await prisma.messages.findMany({
            where: {
                chatId
            }
        });
        console.log(messages);
        return messages
    }catch(error){
        console.log(error);
    }
    
}
