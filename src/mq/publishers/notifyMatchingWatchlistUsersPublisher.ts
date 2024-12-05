import { createChannel, setupExchange } from "../rabbitmq";

export async function notifyMatchingWatchlistUsers(usersToUpdate: any[]) {
  const { connection, channel } = await createChannel();
  const exchange = "notification-exchange";

  await setupExchange(channel, exchange, "direct", { durable: true });

  const message = JSON.stringify({ usersToUpdate });

  channel.publish(exchange, "watchlist.match", Buffer.from(message));
  console.log(`Notified users of matching watchlist updates.`);

  await channel.close();
  await connection.close();
}
