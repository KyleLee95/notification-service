import amqp from "amqplib";
import axios from "axios";

const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const connectionString = `amqp://${rabbitmqHost}:5672`;

async function startConsumer() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();
  const exchange = "notification-service";
  const queues = [
    {
      // exchange: "notification-service",
      name: "watchlist-match-queue",
      routingKey: "watchlist.match",
    },
    {
      // exchange: "notification-service",
      name: "auction-ending-soon-queue",
      routingKey: "auction.time",
    },
    {
      // exchange: "notification-service",
      name: "auction-bid-queue",
      routingKey: "auction.bid",
    },
  ];
  await channel.assertExchange(exchange, "direct", {
    durable: true,
  });

  for (const queue of queues) {
    await channel.assertQueue(queue.name, { durable: true });
    await channel.bindQueue(queue.name, exchange, queue.routingKey);

    channel.consume(queue.name, async (msg) => {
      if (msg) {
        // const { auctionId } = JSON.parse(msg.content.toString());
        try {
          // console.log(`Activating auction ${auctionId}...`);
          // await axios.put(
          // `${auctionServiceURL}/api/auctions/${auctionId}/inactivate`,
          //   {
          //     isActive: true,
          //   },
          // );
          // console.log(`Auction ${auctionId} activated successfully.`);
        } catch (error) {
          // console.error(`Failed to activate auction ${auctionId}:`, error);
        }

        channel.ack(msg);
      }
    });
  }
}

startConsumer().catch(console.error);
