import { createChannel, setupExchange, setupQueue } from "../rabbitmq";
import { sendEmail } from "../../lib/ses";
import { findUsersByUserId } from "../../lib/cognito";

export async function newBidConsumer() {
  const { channel } = await createChannel();
  const exchange = "notification-exchange";
  const exchangeType = "direct";
  const queue = "new-bid-queue";
  const routingKey = "bid.new";

  await setupExchange(channel, exchange, exchangeType);
  await setupQueue(channel, queue, exchange, routingKey);

  channel.consume(queue, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        const { userIds, auction } = data;

        const userEmails = await findUsersByUserId(userIds);
        if (userEmails) {
          await sendEmail(
            userEmails,
            `You've been outbid on ${auction.title}!`,
            "Check the auction for more details.",
          );
        }
      } catch (err) {
        console.error("Error processing new bid message:", err);
      }

      channel.ack(msg);
    }
  });

  console.log("New Bid Consumer is running.");
}
