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

const s3Client = new S3Client({ region: process.env.AWS_REGION });

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
  const s3Client = new S3Client({ region: process.env.AWS_REGION });

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

    const stream = await getObjectStream();

    stream
      .pipe(csvParser())
      .on("data", (data) => {
        console.log(data);
      })
      .on("end", async () => {
        console.log(`Parsing for file ${record.s3.object.key} finished`);

        // copy the file to the 'parsed' directory
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: record.s3.bucket.name,
            CopySource: `${record.s3.bucket.name}/${record.s3.object.key}`,
            Key: record.s3.object.key.replace("uploaded", "parsed"),
          })
        );

        // delete the file from the 'uploaded' directory
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: record.s3.bucket.name,
              Key: record.s3.object.key,
            })
          );
        } catch (error) {
          console.error(
            `An error occurred while deleting ${record.s3.object.key}:`
          );
          console.error(error);
        }

        console.log(
          `File ${record.s3.object.key} moved to 'parsed' directory and deleted from 'uploaded' directory`
        );
      })
      .on("error", (error) => {
        console.log(
          `Error while parsing file ${record.s3.object.key}: `,
          error
        );
      });
  }
  console.log(`Event: ${JSON.stringify(event)}`);
};
