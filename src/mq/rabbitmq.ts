import amqp from "amqplib";
import prisma from "../db/index";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function connectToRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  }
  return channel;
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

  consumeMessages("support-messages", async (message: any) => {
    console.log("Saving message to DB:", message);

    await prisma.message.create({
      data: {
        content: message.content,
        senderId: message.userId,
        recipientId: message.adminId,
        messageChainId: 1, // Example: Link to a conversation
      },
    });

    console.log("Message saved to DB");
  });
};
