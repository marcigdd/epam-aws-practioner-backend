import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HelloLambdaStack  extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   
    const lambdaFunction = new lambda.Function(this, 'lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './dist')),
    });

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions."
    });

    const helloFromLambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction, {
      requestTemplates: {
        "application/json":
          `{ "message": "$input.params('message')" }` 
      },
      integrationResponses: [
        { statusCode: '200' },
      ],
      proxy: false,
    });


    // Create a resource /hello and GET request under it
    const helloResource = api.root.addResource("hello");
    // On this resource attach a GET method which pass reuest to our Lambda function
    helloResource.addMethod('GET', helloFromLambdaIntegration, {
      methodResponses: [{ statusCode: '200' }]
    });

    helloResource.addCorsPreflight({
      allowOrigins: ['https://your-frontend-url.com'],
      allowMethods: ['GET'],
    });

  }
}
