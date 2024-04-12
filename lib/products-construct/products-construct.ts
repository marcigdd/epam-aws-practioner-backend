import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ProductsConstruct  extends Construct {
  constructor(scope: Construct, id: string, api: apigateway.RestApi) {
    super(scope, id);

   
    const getProductsList = new lambda.Function(this, 'lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'get-products.main',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/dist')),
    });


    const getProductsListLambdaIntegration = new apigateway.LambdaIntegration(getProductsList, {
      integrationResponses: [
        { statusCode: '200' },
      ],
      proxy: false,
    });


    // Create a resource /hello and GET request under it
    const productsResource = api.root.addResource("products");
    // On this resource attach a GET method which pass reuest to our Lambda function
    productsResource.addMethod('GET', getProductsListLambdaIntegration, {
      methodResponses: [{ statusCode: '200' }]
    });

    productsResource.addCorsPreflight({
      allowOrigins: ['https://dhdv7a2lleuvs.cloudfront.net/'],
      allowMethods: ['GET'],
    });

  }
}
