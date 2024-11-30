import amqp from "amqplib";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqPort = process.env.RABBITMQ_PORT || "5672";
const rabbitmqUser = process.env.RABBITMQ_USER || "guest";
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || "guest";

const connectionString = `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`;

export async function connectToRabbitMQ() {
  try {
    if (!connection) {
      connection = await amqp.connect(connectionString);
      channel = await connection.createChannel();
      console.log("Connected to RabbitMQ");
    }
    return channel;
  } catch (error) {
    console.log("Failed to connect to RabbitMQ:", error);
  }
}

export async function publishMessage(queue: string, message: any) {
  if (!channel) throw new Error("RabbitMQ channel is not initialized");
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Message sent to queue "${queue}":`, message);
}

export async function consumeMessages(
  queue: string,
  callback: (msg: any) => void,
) {
  if (!channel) throw new Error("RabbitMQ channel is not initialized");
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, (msg) => {
    if (msg) {
      const message = JSON.parse(msg.content.toString());
      console.log(`Message received from queue "${queue}":`, message);
      callback(message);
      channel.ack(msg); // Acknowledge the message
    }
  });
}

export const initRabbitMq = async () => {
  await connectToRabbitMQ();

  consumeMessages("auction-create", async (eventPayload: any) => {
    console.log("eventPayload on MQ server", eventPayload);
  });
};
