import { createChannel, setupExchange, setupQueue } from "../rabbitmq";
import { sendEmail } from "../../lib/ses";
import { findUsersByUserId } from "../../lib/cognito";

const generateEmailBody = (auction) => {
  return `
    <p>You've been outbid on the auction: <strong>${auction.title}</strong>.</p>
    <p>
      But there's still time to bid!
      <a href="http://localhost:5173/auctions/${auction.id}" target="_blank">
        Click here to bid again!
      </a>
    </p>
  `;
};

const generateSellerEmailBody = (auction) => {
  return `
    <p>Your auction <strong>${auction.title}</strong> has received a new bid!</p>
    <p>
      <a href="http://localhost:5173/auctions/${auction.id}" target="_blank">
        Click here to check out your auction
      </a>
    </p>
  `;
};

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
        const { userIds, auction, sellerId } = data;

        const userEmails = await findUsersByUserId(userIds);
        if (userEmails) {
          await sendEmail(
            userEmails,
            `You've been outbid on ${auction.title}!`,
            generateEmailBody(auction),
          );
        }

        const sellerEmail = await findUsersByUserId(sellerId);
        //send notification to seller
        await sendEmail(
          sellerEmail,
          `You've received a bid on ${auction.title}`,
          generateSellerEmailBody(auction),
        );
      } catch (err) {
        console.error("Error processing new bid message:", err);
      }

      channel.ack(msg);
    }
  });

  console.log("New Bid Consumer is running.");
}
