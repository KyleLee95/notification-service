import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
const AWS_REGION = process.env.AWS_REGION || "us-east-2";
const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
});

async function findUsersByUserId(userIds: string[]) {
  const realUsers = ["c1bba5c0-b001-7085-7a2e-e74d5399c3d1"];
  const matchedUsers = [];

  for (const userId of userIds) {
    try {
      const isRealUser = realUsers.includes(userId);
      if (!isRealUser) {
        continue;
      }
      console.log("matched", userId);
      // Query Cognito by email
      const command = new AdminGetUserCommand({
        UserPoolId: "us-east-2_gyo9HVnEr",
        Username: userId, // Use `sub` or `username`
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
  console.log("matchedUsers", matchedUsers);

  return matchedUsers;
}

export { cognitoClient, findUsersByUserId };
