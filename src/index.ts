import dotenv from "dotenv";
const envFile = process.env.DEV ? "../.env" : ".";
dotenv.configDotenv({ path: envFile });

import Fastify from "fastify";
import { startConsumer } from "./mq/consumer";

const server = Fastify({
  logger: true,
});

async function main() {
  const PORT = process.env.PORT || 4001;
  startConsumer().catch(console.error);

  server.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });

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
