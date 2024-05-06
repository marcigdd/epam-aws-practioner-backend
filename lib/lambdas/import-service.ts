import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
  Context,
  S3Event,
} from "aws-lambda";
import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSEvent } from "aws-lambda";
import { ProductData } from "../db/populate-db";
import { productService } from "../services/product-service";
import AWS from "aws-sdk";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const sns = new AWS.SNS();

export const generateUploadUrl: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const fileName = event.queryStringParameters?.fileName;
  if (!fileName) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent X-Requested-With",
      },
      body: 'Missing "name" query parameter',
    };
  }

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET,
    Key: `uploaded/${fileName}`,
    ContentType: "text/csv",
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent X-Requested-With",
    },
    body: JSON.stringify({ uploadURL: signedUrl }),
  };
};
export const parseProductsFile = async (event: S3Event, _context: Context) => {
  const tasks: Promise<void>[] = [];
  const sqsQueueUrl = process.env.SQS_URL;

  for (const record of event.Records) {
    console.log(`Processing file ${record.s3.object.key}`);

    const getObjectStream = async () => {
      const { Body } = await s3Client.send(
        new GetObjectCommand({
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key,
        })
      );

      if (!(Body instanceof Readable)) {
        throw new Error("Body is not a readable stream.");
      }

      return Body;
    };

    const processRecord = async () => {
      const stream = await getObjectStream();

      return new Promise<void>((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on("data", async (data) => {
            console.log("data", data);
            try {
              const message = JSON.stringify(data);
              await sqsClient.send(
                new SendMessageCommand({
                  QueueUrl: sqsQueueUrl,
                  MessageBody: message,
                })
              );
              console.log(`Message sent to SQS: ${message}`);
            } catch (error) {
              console.error("Error sending message to SQS:", error);
            }
          })
          .on("end", async () => {
            console.log(`Parsing for file ${record.s3.object.key} finished`);
            try {
              console.log("Copying file to 'parsed' directory");
              await s3Client.send(
                new CopyObjectCommand({
                  Bucket: record.s3.bucket.name,
                  CopySource: `${record.s3.bucket.name}/${record.s3.object.key}`,
                  Key: record.s3.object.key.replace("uploaded", "parsed"),
                })
              );
              console.log("File copied to 'parsed' directory");
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: record.s3.bucket.name,
                  Key: record.s3.object.key,
                })
              );
              console.log("File deleted from 'uploaded' directory");
              resolve();
            } catch (error) {
              console.error(
                `An error occurred while moving ${record.s3.object.key}:`
              );
              console.error(error);
              reject(error);
            }
          })
          .on("error", async (error) => {
            console.log(
              `Error while parsing file ${record.s3.object.key}: `,
              error
            );
            reject(error);
          });
      });
    };

    tasks.push(processRecord());
  }

  await Promise.all(tasks);

  console.log(`Event: ${JSON.stringify(event)}`);
};
export const catalogBatchProcess = async (event: SQSEvent): Promise<void> => {
  console.log(`Event: ${JSON.stringify(event)}`);

  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body) as ProductData;
      console.log("Message body:", messageBody);

      const product = await productService.createProduct({
        ...messageBody,
        price: Number(messageBody.price),
      });
      const message = `Product with ID ${JSON.stringify(
        product
      )} has been created.`;

      await sns
        .publish({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Subject: "Product Created",
          Message: message,
        })
        .promise();

      console.log(`SNS message sent: ${message}`);
      console.log("Product created:", JSON.stringify(product));
    } catch (error) {
      console.error("Error occured:", error);
    }
  }
};
