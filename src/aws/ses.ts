import {
  SESClient,
  SendEmailCommand,
  type SendEmailCommandInput,
} from "@aws-sdk/client-ses";

// Load environment variables

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY_ID = process.env.AWS_SECRET_ACCESS_KEY_ID;
const AWS_REGION = process.env.AWS_REGION || "us-east-2";

const sesClient = new SESClient([
  {
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY_ID,
    },
  },
]);

async function sendEmail(to: string[], subject: string, body: string) {
  try {
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: to, // Recipient email
      },
      Message: {
        Body: {
          Text: { Data: body }, // Plain text body
          Html: { Data: `<p>${body}</p>` }, // HTML body
        },
        Subject: { Data: subject },
      },
      Source: "kyle@kylelee.dev", // Verified sender email
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
export { sendEmail, sesClient };
