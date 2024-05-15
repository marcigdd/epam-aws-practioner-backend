import { APIGatewayAuthorizerResult } from "aws-lambda";

export const handler = async (event: {
  authorizationToken: string;
  methodArn: any;
}): Promise<APIGatewayAuthorizerResult> => {
  if (!event.authorizationToken) {
    throw new Error("Unauthorized");
  }

  const encodedCredentials = event.authorizationToken.split(" ")[1];
  const [username, password] = Buffer.from(encodedCredentials, "base64")
    .toString()
    .split(":");
  if (!process.env[username]) {
    throw new Error("Unauthorized");
  }

  const storedPassword = process.env[username];

  console.log("username", username);
  console.log("password", password);
  console.log("storedPassword", storedPassword);

  if (storedPassword !== password) {
    throw new Error("Forbidden");
  }

  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: "Allow",
        Resource: event.methodArn,
      },
    ],
  };

  return {
    principalId: username,
    policyDocument,
  };
};
