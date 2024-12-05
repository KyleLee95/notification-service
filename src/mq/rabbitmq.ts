import amqp from "amqplib";

const rabbitmqHost =
  process.env.DEV === "TRUE" ? "localhost" : process.env.RABBITMQ_HOST;
const connectionString = `amqp://${rabbitmqHost}:5672`;

// Create and return a RabbitMQ channel
export async function createChannel() {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createChannel();
  return { connection, channel };
}

// Assert an exchange with the given configuration
export async function setupExchange(
  channel: amqp.Channel,
  exchange: string,
  type: string,
  options?: amqp.Options.AssertExchange,
) {
  await channel.assertExchange(exchange, type, options);
}

// Assert and bind a queue
export async function setupQueue(
  channel: amqp.Channel,
  queue: string,
  exchange: string,
  routingKey: string,
) {
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);
}
