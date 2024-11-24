import { type FastifyInstance } from "fastify";

export async function messageRoutes(router: FastifyInstance) {
  router.get("/", async (request, reply) => {
    return { message: "List of products" };
  });

  router.post("/", async (request, reply) => {
    const { name } = request.body as { name: string };
    return { message: `Product ${name} added` };
  });
}
