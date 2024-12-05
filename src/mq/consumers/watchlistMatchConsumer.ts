import { createChannel, setupExchange, setupQueue } from "../rabbitmq";
import { sendEmail } from "../../lib/ses";
import { findUsersByUserId } from "../../lib/cognito";

export async function watchlistMatchConsumer() {
  const { channel } = await createChannel();
  const exchange = "notification-exchange";
  const exchangeType = "direct";
  const queue = "watchlist-match-queue";
  const routingKey = "watchlist.match";

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
            "A new auction matching your watchlist criteria has been posted",
            `${auction.id}`,
          );
        }
      } catch (err) {
        console.error("Error processing watchlist match message:", err);
      }

      channel.ack(msg);
    }
  });

  console.log("Watchlist Match Consumer is running.");
}
