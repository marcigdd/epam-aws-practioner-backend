import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { ProductsConstruct } from "./products-construct/products-construct";
import { ProductConstruct } from "./product-construct.ts/product-construct";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create dynamodb table to called products partition key id string and sort key title string
    const productTable = new dynamodb.Table(this, "Product", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "title", type: dynamodb.AttributeType.STRING },
      tableName: "Product",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const stockTable = new dynamodb.Table(this, "Stock", {
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
      tableName: "Stock",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions.",
    });

    const productsConstruct = new ProductsConstruct(
      this,
      "products-construct",
      api
    );
    const productConstruct = new ProductConstruct(
      this,
      "product-construct",
      api
    );
    // Grant the lambda functions read and write access to the DynamoDB table
    productsConstruct.getProductsList.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Scan"],
        resources: [productTable.tableArn, stockTable.tableArn],
      })
    );

    productConstruct.getProductsList.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Scan"],
        resources: [productTable.tableArn, stockTable.tableArn],
      })
    );
    productTable.grantReadWriteData(productsConstruct.getProductsList);
    stockTable.grantReadWriteData(productsConstruct.getProductsList);
    productTable.grantReadWriteData(productConstruct.getProductsList);
    stockTable.grantReadWriteData(productConstruct.getProductsList);
  }
}
