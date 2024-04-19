// Filename: Todo/handler.ts
import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDBClient({ region: "us-east-2" });
const tableName = "Todos";

export const addTodo: Handler = async (event, context) => {
  try {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: uuidv4() },
        createdAt: { N: new Date().getTime().toFixed() },
        body: { S: event.todoBody },
      },
    });

    const result = await dynamoDB.send(command);

    console.log("PutItem succeeded:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding item to DynamoDB table");
  }
};
