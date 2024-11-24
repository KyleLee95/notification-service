import { prisma } from "./prisma";
import { connectToRabbitMQ, consumeMessages } from "./rabbitmq";

export const initRabbitMq = async () => {
  await connectToRabbitMQ();

  consumeMessages("support-messages", async (message: any) => {
    console.log("Saving message to DB:", message);

    await prisma.message.create({
      data: {
        content: message.content,
        senderId: message.userId,
        recipientId: message.adminId,
        messageChainId: 1, // Example: Link to a conversation
      },
    });

    console.log("Message saved to DB");
  });
};
