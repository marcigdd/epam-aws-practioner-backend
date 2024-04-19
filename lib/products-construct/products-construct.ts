import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

// expose the lambda function on the class
export class ProductsConstruct extends Construct {
  public readonly getProductsList: lambda.Function;
  constructor(scope: Construct, id: string, api: apigateway.RestApi) {
    super(scope, id);

    this.getProductsList = new lambda.Function(this, "lambda-function", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "get-products.main",
      code: lambda.Code.fromAsset("dist"),
    });

    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      this.getProductsList,
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
