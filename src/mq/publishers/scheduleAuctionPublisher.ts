import { createChannel, setupExchange } from "../rabbitmq";

export async function scheduleAuction(
  auctionId: number,
  startTime: Date,
  endTime: Date,
) {
  const { connection, channel } = await createChannel();
  const exchange = "auction-exchange";

  await setupExchange(channel, exchange, "x-delayed-message", {
    durable: true,
    arguments: { "x-delayed-type": "direct" },
  });

  const startTimeDelay = startTime.getTime() - Date.now();
  const startDelay = startTimeDelay <= 0 ? 20 : startTimeDelay;
  const endTimeDelay = endTime.getTime() - Date.now();

  const message = JSON.stringify({ auctionId });

  channel.publish(exchange, "auction.start", Buffer.from(message), {
    headers: { "x-delay": startDelay },
  });
  console.log(
    `Scheduled auction ${auctionId} to start in ${startDelay}ms (${startTime.toISOString()}).`,
  );

  channel.publish(exchange, "auction.end", Buffer.from(message), {
    headers: { "x-delay": endTimeDelay },
  });
  console.log(
    `Scheduled auction ${auctionId} to end in ${endTimeDelay}ms (${endTime.toISOString()}).`,
  );

  await channel.close();
  await connection.close();
}
