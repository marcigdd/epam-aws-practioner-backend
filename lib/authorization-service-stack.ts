import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dotenv from "dotenv";

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new lambda.Function(this, "basicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "basic-authorizer.handler",
      code: lambda.Code.fromAsset("dist"),
      environment: {
        marcigdd: "test",
      },
    });

    new cdk.CfnOutput(this, "ExportBasicAuthorizer", {
      value: basicAuthorizer.functionArn,
      exportName: "basicAuthorizerArn",
    });
  }
}
