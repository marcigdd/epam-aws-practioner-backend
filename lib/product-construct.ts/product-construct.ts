import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ProductConstruct extends Construct {
  constructor(scope: Construct, id: string, api: apigateway.RestApi) {
    super(scope, id);

    const getProductsList = new lambda.Function(this, "lambda-function", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "get-product-by-id.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/dist")),
    });

    const getProductLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsList,
      {
        requestTemplates: {
          "application/json": `{
              "id": "$input.params('id')"
            }`,
        },
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
      }
    );

    // Create a resource /hello and GET request under it
    const productResource = api.root.addResource("product");
    const idResource = productResource.addResource("{id}");

    // On this resource attach a GET method which pass reuest to our Lambda function
    idResource.addMethod("GET", getProductLambdaIntegration, {
      requestParameters: {
        "method.request.path.id": true,
      },
      methodResponses: [{ statusCode: "200" }],
    });

    idResource.addCorsPreflight({
      allowOrigins: ["https://di9quc0wwixjr.cloudfront.net/"],
      allowMethods: ["GET"],
    });
  }
}
