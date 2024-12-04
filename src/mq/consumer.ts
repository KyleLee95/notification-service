import amqp from "amqplib";
import { sendEmail } from "../aws/ses";
import { findUsersByUserId } from "../aws/cognito";
const rabbitmqHost =
  process.env.DEV === "TRUE" ? "localhost" : process.env.RABBITMQ_HOST;
const connectionString = `amqp://${rabbitmqHost}:5672`;

async function startConsumer() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();
  const queues = [
    {
      exchange: "notification-exchange",
      name: "watchlist-match-queue",
      routingKey: "watchlist.match",
      exchangeType: "direct",
    },
    {
      exchange: "notification-exchange",
      name: "new-bid-queue",
      routingKey: "bid.new",
      exchangeType: "direct",
    },
  ];

  // {
  //   exchange: "auction-exchange",
  //   name: "auction-ending-soon-queue",
  //   routingKey: "auction.time",
  //   exchangeType: "x-delayed-message",
  // },
  // channel.publish(exchange, "auction.end", Buffer.from(message), {
  //   headers: { "x-delay": endTimeDelay },
  // });

  for (const queue of queues) {
    await channel.assertExchange(queue.exchange, queue.exchangeType, {
      durable: true,
    });
    await channel.assertQueue(queue.name, { durable: true });
    await channel.bindQueue(queue.name, queue.exchange, queue.routingKey);

    channel.consume(queue.name, async (msg) => {
      try {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          const { eventType, userIds, auction } = data;
          const userEmails = await findUsersByUserId(userIds);
          console.log("EVENT_TYPE", eventType);
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
            case "AUCTION_TIME_REMAINING":
              if (!userEmails) {
                return null;
              }
              await sendEmail(
                userEmails,
                "An auction you're watching is ending soon!",
                `${auction.id}`,
              );
              break;
            default:
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
