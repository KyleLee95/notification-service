import Fastify from "fastify";
import { messageQueueRoutes } from "./routes/mq";
import { initRabbitMq } from "./mq/rabbitmq";

const server = Fastify({
  logger: true,
});

async function main() {
  const PORT = process.env.PORT || 4001;
  // init connection to rabbitMQ
  await initRabbitMq();

  server.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });

  server.register(messageQueueRoutes, { prefix: "/api/notifications/mq" });

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
