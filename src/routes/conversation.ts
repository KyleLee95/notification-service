import { type FastifyInstance } from "fastify";

import prisma from "../db";

export const conversationRoutes = async (router: FastifyInstance) => {
  router.get("/", async (request, reply) => {
    const query = request.query as { userId?: string };

    if (!query.userId) {
      return reply
        .status(400)
        .send({ error: "Missing userId query parameter" });
    }

    return { message: `Fetching messages for userId ${query.userId}` };
  });

  router.post("/", async (request, reply) => {
    const body = request.body as { userId: string; message: string };
    if (!body) {
      return reply.status(400).send({ error: "Missing required parameters" });
    }

    const newConversation = await prisma.conversation.create({
      data: {
        title: "Support Chat",
        user: { connect: { id: 1 } }, // Link to a user (customer or admin)
      },
    });

    return { message: `Product ${name} added` };
  });
};
