import Fastify from "fastify";
import { messageRoutes } from "./routes/message";
const server = Fastify({
  logger: true,
});

async function main() {
  const PORT = process.env.PORT || 3001;

  server.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });

  server.register(messageRoutes, { prefix: "/api/messages" });

  server.listen({ port: PORT as number }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    console.log(`Server started at ${address}`);
  });
}

main();
export default server;
