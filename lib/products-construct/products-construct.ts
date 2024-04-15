import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class ProductsConstruct extends Construct {
  constructor(scope: Construct, id: string, api: apigateway.RestApi) {
    super(scope, id);

    const getProductsList = new lambda.Function(this, "lambda-function", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "get-products.main",
      code: lambda.Code.fromAsset("dist"),
    });

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsList,
      {
        proxy: true,
      }
    );

    const productsResource = api.root.addResource("products");

    const corsOptions: apigateway.CorsOptions = {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
    };

    productsResource.addCorsPreflight(corsOptions);
    productsResource.addMethod("GET", getProductsListLambdaIntegration);
  }
}
