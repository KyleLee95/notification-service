import "dotenv/config";
import { sendEmail } from "./lib/ses";

import Fastify from "fastify";
import { startConsumers } from "./mq/consumers/index";

const server = Fastify({
  logger: true,
});

function main() {
  const PORT = Number(process.env.PORT) || 4001;

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

  server.listen(
    {
      port: PORT,
      host: "0.0.0.0",

      listenTextResolver: (address) => {
        return `notification-service server is listening at ${address}`;
      },
    },
    (err, address) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }

      console.log(`Server started at ${address}`);
    },
  );
}

main();

export default server;
