import { watchlistMatchConsumer } from "./watchlistMatchConsumer";
import { newBidConsumer } from "./newBidConsumer";
import { auctionTimeRemainingConsumer } from "./auctionTimeRemainingConsumer";

export async function startConsumers() {
  console.log("Starting consumers...");
  await Promise.all([
    watchlistMatchConsumer(),
    newBidConsumer(),
    auctionTimeRemainingConsumer(),
  ]);
  console.log("All consumers are running.");
}
