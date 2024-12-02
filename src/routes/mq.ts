import { type FastifyInstance } from "fastify";

export const messageQueueRoutes = async (router: FastifyInstance) => {
  router.post("/activate-auction", async (request, reply) => {
    const { userId, adminId, content } = request.body as {
      userId: number;
      adminId: number;
      content: string;
    };

    return { success: true };
  });
};
