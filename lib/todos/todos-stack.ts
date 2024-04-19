// Filename: todo/TodoStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import { join } from "path";

const tableName = "Todos";

export class TodoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const todosTable = new dynamodb.Table(this, tableName, {
      tableName,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: dynamodb.AttributeType.NUMBER,
      },
    });
    const addTodoLambda = new lambda.Function(this, "lambda-function", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "todos-lambda.addTodo",
      code: lambda.Code.fromAsset("dist"),
      environment: {
        TABLE_NAME: tableName,
      },
    });

    todosTable.grantWriteData(addTodoLambda);
  }
}
