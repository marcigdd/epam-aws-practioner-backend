import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { ProductsConstruct } from "./constructs/products-construct/products-construct";
import { ProductConstruct } from "./constructs/product-construct/product-construct";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ProductServiceConstruct extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create dynamodb table to called products partition key id string and sort key title string
    const productTable = new dynamodb.Table(this, "Product", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "Product",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const stockTable = new dynamodb.Table(this, "Stock", {
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
      tableName: "Stock",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const api = new apigateway.RestApi(this, "product-service-api", {
      restApiName: "Product Service API",
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

    productTable.grantReadData(productsConstruct.getProductsList);
    stockTable.grantReadData(productsConstruct.getProductsList);
    productTable.grantReadData(productConstruct.getProduct);
    stockTable.grantReadData(productConstruct.getProduct);
    productTable.grantWriteData(productsConstruct.createProduct);
  }
}
