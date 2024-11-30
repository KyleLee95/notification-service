import amqp from "amqplib";
import axios from "axios";
const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const auctionServiceURL =
  process.env.AUCTION_SERVICE_URL || "http://localhost:4000";
const connectionString = `amqp://${rabbitmqHost}:5672`;

async function startConsumer() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();

  const exchange = "delayed-exchange";
  const queue = "auction-start-queue";

  await channel.assertExchange(exchange, "x-delayed-message", {
    durable: true,
    arguments: { "x-delayed-type": "direct" },
  });

  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, "auction.start");

  channel.consume(queue, async (msg) => {
    if (msg) {
      const { auctionId } = JSON.parse(msg.content.toString());

      try {
        console.log(`Activating auction ${auctionId}...`);
        await axios.put(
          `${auctionServiceURL}/api/auctions/${auctionId}/activate`,
        );
        console.log(`Auction ${auctionId} activated successfully.`);
      } catch (error) {
        console.error(
          `Failed to activate auction ${auctionId}:`,
          error.message,
        );
      }

      channel.ack(msg);
    }
  });

  console.log("Auction start consumer is running...");
}

export { startConsumer };
