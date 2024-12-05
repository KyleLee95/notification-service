import { createChannel, setupExchange, setupQueue } from "../rabbitmq";
import { sendEmail } from "../../lib/ses";
import { findUsersByUserId } from "../../lib/cognito";

const generateEmailBody = (auction) => {
  return `<p>A new auction <strong>${auction.title}</strong> was posted!</p>
	<p>
		<a href="localhost:5173/auctions/${auction.id}" target="_blank">
			Click here to check it out!
		</a>
	</p>`;
};

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
            generateEmailBody(auction),
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
