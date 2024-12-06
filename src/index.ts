import dotenv from "dotenv";
const envFile = process.env.DEV ? "../.env" : ".";
dotenv.configDotenv({ path: envFile });

import { sendEmail } from "./lib/ses";

import Fastify from "fastify";
import { startConsumers } from "./mq/consumers/index";

const server = Fastify({
  logger: true,
});

function main() {
  const PORT = process.env.PORT || 4001;

  startConsumers()
    .then((data) => {
      console.log("All consumers in the notification service started");
    })
    .catch((error) => {
      console.error("Failed to start consumers", error);
    });

  server.get("/healthcheck", (request, reply) => {
    reply.send({ hello: "world" }).status(200);
  });

  server.post("/api/notifications/sendEmail", async (request, reply) => {
    try {
      const { to, subject, content } = request.body;

      const emailToSend = await sendEmail(to, subject, content);
      if (!emailToSend.MessageId) {
        reply
          .send({
            message: "Email Successfully Sent",
            data: { email: emailToSend },
          })
          .status(200);
      }
    } catch (err) {
      console.error(err);
    }
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
