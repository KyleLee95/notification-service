import amqp from "amqplib";
import { sendEmail } from "../aws/ses";
import { findUsersByUserId } from "../aws/cognito";
const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const connectionString = `amqp://${rabbitmqHost}:5672`;
// const connectionString = `amqp://guest:guest@rabbitmq:5672`;

async function startConsumer() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();
  const exchange = "notification-exchange";
  const queues = [
    {
      name: "watchlist-match-queue",
      routingKey: "watchlist.match",
    },
    {
      name: "auction-ending-soon-queue",
      routingKey: "auction.time",
    },
    {
      name: "new-bid-queue",
      routingKey: "bid.new",
    },
  ];
  await channel.assertExchange(exchange, "direct", {
    durable: true,
  });

  for (const queue of queues) {
    await channel.assertQueue(queue.name, { durable: true });
    await channel.bindQueue(queue.name, exchange, queue.routingKey);

    channel.consume(queue.name, async (msg) => {
      try {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          const { eventType, userIds, auction } = data;
          const userEmails = await findUsersByUserId(userIds);
          console.log("????", userEmails);
          switch (eventType) {
            case "NOTIFY_WATCHLIST_MATCH":
              if (!userEmails) {
                return null;
              }
              await sendEmail(
                userEmails,
                "A new auction matching your watchlist critera has been posted",
                `${auction.id}`,
              );
              break;
            case "NEW_BID":
              if (!userEmails) {
                return null;
              }
              await sendEmail(
                userEmails,
                `You've been outbid on ${auction.title}!`,
                "test",
              );

              break;
            case "AUCTION_TIME_REMANING":
              if (!userEmails) {
                return null;
              }
              await sendEmail(
                userEmails,
                "A new auction matching your watchlist critera has been posted",
                `${auction.id}`,
              );
              break;
            default:
              console.log("no match");
              break;
          }
        }
      } catch (error) {
        console.error(error);
      }
      channel.ack(msg);
    });
  }
}
export { startConsumer };
