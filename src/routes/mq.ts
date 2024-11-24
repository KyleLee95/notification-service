import { type FastifyInstance } from "fastify";
import { publishMessage, consumeMessages } from "../mq/rabbitmq";

export const messageQueueRoutes = async (router: FastifyInstance) => {
  router.post("/send-message", async (request, reply) => {
    const { userId, adminId, content } = request.body as {
      userId: number;
      adminId: number;
      content: string;
    };

    // Publish message to RabbitMQ
    await publishMessage("support-messages", { userId, adminId, content });

    return { success: true };
  });
};
