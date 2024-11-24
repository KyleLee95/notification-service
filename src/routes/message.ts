import { type FastifyInstance } from "fastify";

import prisma from "../db";

export const messageRoutes = async (router: FastifyInstance) => {
  router.get("/", async (request, reply) => {
    const query = request.query as { userId?: string };
    const messages = prisma.message.findMany({});

    if (!query.userId) {
      return reply
        .status(400)
        .send({ error: "Missing userId query parameter" });
    }

    return { message: `Fetching messages for userId ${query.userId}` };
  });

  router.post("/", async (request, reply) => {
    const { senderId, recipientId, conversationId, content } = request.body as {
      senderId: string;
      recipientId: string;
      conversationId: string;
      content: string;
    };

    if (!request.body) {
      return reply.status(400).send({ error: "Missing required parameters" });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: content,
        sender: { connect: { awsId: senderId } }, // Sender (customer or admin)
        recipient: { connect: { awsId: recipientId } }, // Recipient (customer or admin)
        conversation: { connect: { id: parseInt(conversationId) } }, // Link to conversation
      },
    });

    return { message: `Product ${name} added` };
  });
};
