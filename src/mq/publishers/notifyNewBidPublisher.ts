import { createChannel, setupExchange } from "../rabbitmq";

export async function notifyNewBid(bidData: any) {
  const { connection, channel } = await createChannel();
  const exchange = "notification-exchange";

  await setupExchange(channel, exchange, "direct", { durable: true });

  const message = JSON.stringify({ bidData });

  channel.publish(exchange, "bid.new", Buffer.from(message));
  console.log(`Notified users of a new bid on auction ${bidData.auctionId}.`);

  await channel.close();
  await connection.close();
}
