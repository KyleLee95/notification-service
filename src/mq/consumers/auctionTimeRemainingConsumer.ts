import { createChannel, setupExchange, setupQueue } from "../rabbitmq";
import { sendEmail } from "../../lib/ses";
import { findUsersByUserId } from "../../lib/cognito";

const generateEmailBody = (auction) => {
  return `
<p> <strong>${auction.title}</strong> is ending soon!</p>
<p>
	<a href="localhost:5173/auctions/${auction.id}" target="_blank">
	Click here to see details
	</a>
</p>`;
};
export async function auctionTimeRemainingConsumer() {
  const { channel } = await createChannel();
  const exchange = "auction-exchange";
  const exchangeType = "x-delayed-message";
  const queue = "auction-time-remaining-queue";
  const routingKey = "auction.time";

  await setupExchange(channel, exchange, exchangeType, {
    durable: true,
    arguments: { "x-delayed-type": "direct" },
  });
  await setupQueue(channel, queue, exchange, routingKey);

  channel.consume(queue, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        const { userIds, auction, sellerId } = data;

        console.log("Ending soon Auction?", auction);

        const userEmails = await findUsersByUserId(userIds);
        if (userEmails) {
          await sendEmail(
            userEmails,
            "An auction you're watching is ending soon!",
            generateEmailBody(auction),
          );
        }

        const sellerEmail = await findUsersByUserId(sellerId);
        //send notification to seller
        await sendEmail(
          sellerEmail,
          "Your auction is ending soon",
          generateEmailBody(auction),
        );
      } catch (err) {
        console.error("Error processing auction time remaining message:", err);
      }

      channel.ack(msg);
    }
  });

  console.log("Auction Time Remaining Consumer is running.");
}
