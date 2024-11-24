import Fastify from "fastify";
import { messageRoutes } from "./routes/message";
import { conversationRoutes } from "./routes/conversation";
import { messageQueueRoutes } from "./routes/mq";
import { initRabbitMq } from "./mq/rabbitmq";

const server = Fastify({
  logger: true,
});

async function main() {
  const PORT = process.env.PORT || 3001;
  //init connection to rabbitMQ
  await initRabbitMq();

  server.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });

  server.register(messageRoutes, { prefix: "/api/messages" });
  server.register(conversationRoutes, { prefix: "/api/conversations" });
  server.register(messageQueueRoutes, { prefix: "/api/mq" });

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
