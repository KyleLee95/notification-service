import dotenv from "dotenv";
const envFile = process.env.DEV ? "../.env" : ".";
dotenv.configDotenv({ path: envFile });

import Fastify from "fastify";
import { startConsumers } from "./mq/consumers/index";

const server = Fastify({
  logger: true,
});

function main() {
  const PORT = process.env.PORT || 4001;
  startConsumers().catch((error) => {
    console.error("Failed to start consumers", error);
  });

  server.get("/healthcheck", (request, reply) => {
    reply.send({ hello: "world" }).status(200);
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
