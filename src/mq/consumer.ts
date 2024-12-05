import amqp from "amqplib";
import { sendEmail } from "../aws/ses";
import { findUsersByUserId } from "../aws/cognito";

const rabbitmqHost =
  process.env.DEV === "TRUE" ? "localhost" : process.env.RABBITMQ_HOST;
const connectionString = `amqp://${rabbitmqHost}:5672`;

async function startConsumer() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();

  const notificationExchange = "notification-exchange";
  const notificationExchangeType = "direct";

  //watchlist
  const watchlistMatchQueue = "watchlist-match-queue";
  const watchlistMatchRoutingKey = "watchlist.match";
  await channel.assertExchange(notificationExchange, notificationExchangeType, {
    durable: true,
  });

  //watchlist match
  await channel.assertQueue(watchlistMatchQueue, { durable: true });
  await channel.bindQueue(
    watchlistMatchQueue,
    notificationExchange,
    watchlistMatchRoutingKey,
  );
  channel.consume(watchlistMatchQueue, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      const { eventType, userIds, auction } = data;
      const userEmails = await findUsersByUserId(userIds);
      if (!userEmails) {
        return null;
      }
      await sendEmail(
        userEmails,
        "A new auction matching your watchlist critera has been posted",
        `${auction.id}`,
      );
    } catch (err) {
      console.error(err);
    }

    channel.ack(msg);
  });

  //new bid

  const newBidQueue = "new-bid-queue";
  const newBidRoutingKey = "bid.new";
  await channel.assertExchange(notificationExchange, notificationExchangeType, {
    durable: true,
  });
  await channel.assertQueue(newBidQueue, { durable: true });
  await channel.bindQueue(newBidQueue, notificationExchange, newBidRoutingKey);

  channel.consume(newBidQueue, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      const { eventType, userIds, auction } = data;
      const userEmails = await findUsersByUserId(userIds);
      if (!userEmails) {
        return null;
      }
      await sendEmail(
        userEmails,
        `You've been outbid on ${auction.title}!`,
        "test",
      );
    } catch (err) {
      console.error(err);
    }

    channel.ack(msg);
  });

  //auction exchange
  const auctionExchange = "auction-exchange";
  const auctionExchangeType = "x-delayed-message";
  const auctionTimeRemainingQueue = "auction-time-remaining-queue";
  const auctionRoutingKey = "auction.time";
  await channel.assertExchange(auctionExchange, auctionExchangeType, {
    durable: true,
  });
  await channel.assertQueue(auctionTimeRemainingQueue, { durable: true });
  await channel.bindQueue(
    auctionTimeRemainingQueue,
    auctionExchange,
    auctionRoutingKey,
  );

  channel.consume(auctionTimeRemainingQueue, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    const { eventType, userIds, auction } = data;
    const userEmails = await findUsersByUserId(userIds);
    if (!userEmails) {
      return null;
    }
    await sendEmail(
      userEmails,
      "An auction you're watching is ending soon!",
      `${auction.id}`,
    );
    channel.ack(msg);
  });
}
export { startConsumer };
