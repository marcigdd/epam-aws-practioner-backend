import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "ImportServiceBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    const api = new apigateway.RestApi(this, "import-service-api", {
      restApiName: "Import Service API",
      description: "This API serves the Lambda functions.",
    });
    const importResource = api.root.addResource("import");

    const importProductsFile = new lambda.Function(this, "importProductsFile", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "import-service.generateUploadUrl",
      code: lambda.Code.fromAsset("dist"),
      environment: {
        BUCKET: bucket.bucketName,
      },
    });

    const catalogItemsQueue = new sqs.Queue(this, "catalogItemsQueue");

    const createProductTopic = new sns.Topic(this, "createProductTopic", {
      displayName: "Create Product Topic",
    });

    const emailSubscription = new subscriptions.EmailSubscription(
      "marcigdd@gmail.com"
    );
    createProductTopic.addSubscription(emailSubscription);

    const catalogBatchProcess = new lambda.Function(
      this,
      "catalogBatchProcess",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "import-service.catalogBatchProcess",
        code: lambda.Code.fromAsset("dist"),
        environment: {
          SNS_TOPIC_ARN: createProductTopic.topicArn,
        },
      }
    );

    createProductTopic.grantPublish(catalogBatchProcess);

    const productTableArn = cdk.Fn.importValue("ProductTableArn");
    const productTable = dynamodb.Table.fromTableArn(
      this,
      "ImportedProductTable",
      productTableArn
    );
    productTable.grantWriteData(catalogBatchProcess);

    catalogBatchProcess.addEventSource(
      new SqsEventSource(catalogItemsQueue, { batchSize: 5 })
    );

    const importFileParser = new lambda.Function(this, "importFileParser", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "import-service.parseProductsFile",
      code: lambda.Code.fromAsset("dist"),
      environment: {
        SQS_URL: catalogItemsQueue.queueUrl,
      },
    });

    const sqsSendMessagePolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [catalogItemsQueue.queueArn],
      actions: ["sqs:SendMessage"],
    });

    importFileParser.addToRolePolicy(sqsSendMessagePolicyStatement);

    const importProductsFileLambdaIntegration =
      new apigateway.LambdaIntegration(importProductsFile, {
        proxy: true,
      });

    bucket.grantReadWrite(importProductsFile);
    bucket.grantReadWrite(importFileParser);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: "uploaded/" }
    );

    const basicAuthorizerArn = cdk.Fn.importValue("basicAuthorizerArn");
    const basicAuthorizer = lambda.Function.fromFunctionArn(
      this,
      "ImportedBasicAuthorizer",
      basicAuthorizerArn
    );

    const authorizer = new apigateway.TokenAuthorizer(this, "basicAuthorizer", {
      handler: basicAuthorizer,
      identitySource: "method.request.header.Authorization",
    });

    importResource.addMethod("GET", importProductsFileLambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer,
    });
    importResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Security-Token",
        "X-Amz-User-Agent",
        "X-Requested-With",
      ],
    });
  }
}
