import * as cdk from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';
import { ProductsConstruct } from './products-construct/products-construct';
import { ProductConstruct } from './product-construct.ts/product-construct';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiGatewayStack  extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions."
    });

    new ProductsConstruct(this, 'products-construct', api);
    new ProductConstruct(this, 'product-construct', api);
  }
}
