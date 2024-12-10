import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID!,
  },
});

async function findUsersByUserId(watchlistUserIds: any[]) {
  const matchedUsers = [];

  for (const userId of watchlistUserIds) {
    try {
      // Query Cognito by email
      const command = new AdminGetUserCommand({
        UserPoolId: "us-east-2_gyo9HVnEr",
        Username: "c1bba5c0-b001-7085-7a2e-e74d5399c3d1", // Use `sub` or `username`
      });

      const response = await cognitoClient.send(command);

      if (response) {
        // Extract attributes
        const attributes = response.UserAttributes;

        // Find the email attribute
        const emailAttribute = attributes?.find(
          (attr) => attr.Name === "email",
        );
        const email = emailAttribute?.Value;

        matchedUsers.push(email);
      }
    } catch (error) {
      console.error(`Error fetching the email for ${userId}`);

      console.error(error);
    }
  }
  console.log("matched?", matchedUsers);
  return matchedUsers;
}

export { cognitoClient, findUsersByUserId };
