import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
// Load environment variables

// ADMIN_USERID=c1bba5c0-b001-7085-7a2e-e74d5399c3d1
const AWS_ACCESS_KEY_ID = "AKIAQFC27RBPVG5N6T2B";
const AWS_SECRET_ACCESS_KEY_ID = "8Tg/0Fm1z6nVfuO6Ykt3I8vpjOGEeiriZ55lzQST";
// AWS_REGION=us-east-2
// AWS_COGNITO_USERPOOL_ID=us-east-2_gyo9HVnEr
const sesClient = new SESClient([
  {
    region: "us-east-2",
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY_ID,
    },
  },
]);
console.log(process.env);
async function sendEmail(to: string[], subject: string, body: string) {
  try {
    const params = {
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
      Source: process.env.SENDER_EMAIL! || "kyle@kylelee.dev", // Verified sender email
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
