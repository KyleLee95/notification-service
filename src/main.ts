import Fastify from "fastify";
import { startConsumer } from "./mq/consumer";
import * as dotenv from "dotenv";
dotenv.config();

const server = Fastify({
  logger: true,
});

async function main() {
  const PORT = process.env.PORT || 4001;
  // init connection to rabbitMQ
  startConsumer().catch(console.error);

  server.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });

  startConsumer().catch(console.error);

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
