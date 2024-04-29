import { APIGatewayProxyHandler, Context, S3Event } from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";
import * as csvParser from "csv-parser";

const s3 = new AWS.S3({
  signatureVersion: "v4",
  region: process.env.AWS_REGION,
});

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers":
    "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent X-Requested-With",
};

export const generateUploadUrl: APIGatewayProxyHandler = async (event) => {
  console.log(`Event: ${JSON.stringify(event)}`);
  const fileName =
    event.queryStringParameters && event.queryStringParameters.fileName;

  if (!fileName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "fileName is required",
      }),
    };
  }

  const s3Params = {
    Bucket: "ImportServiceBucket", // replace with your bucket name
    Key: `uploaded/${fileName}`,
    Expires: 900, // time to expire in seconds
  };

  try {
    const uploadURL = s3.getSignedUrl("putObject", s3Params);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadURL }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not generate a signed url" }),
    };
  }
};

export const parseProductsFile = async (
  event: S3Event,
  _context: Context
): Promise<void> => {
  for (const record of event.Records) {
    const s3Stream = s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
      .createReadStream();

    s3Stream
      .pipe(csvParser())
      .on("data", (data) => {
        console.log(data);
      })
      .on("end", () => {
        console.log(`Parsing for file ${record.s3.object.key} finished`);
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
