import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class ProductConstruct extends Construct {
  constructor(scope: Construct, id: string, api: apigateway.RestApi) {
    super(scope, id);

    const getProductsList = new lambda.Function(this, "lambda-function", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "get-product-by-id.main",
      code: lambda.Code.fromAsset("dist"),
    });

    const getProductLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsList,
      {
        proxy: true,
      }
    );

    const productResource = api.root.addResource("product");
    const idResource = productResource.addResource("{id}");

    idResource.addMethod("GET", getProductLambdaIntegration);

    idResource.addCorsPreflight({
      allowOrigins: ["https://di9quc0wwixjr.cloudfront.net/"],
      allowMethods: ["GET"],
    });
  }
}
