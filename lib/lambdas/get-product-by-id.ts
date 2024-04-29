import { productService } from "../services/product-service";
import { BadRequestError, NotFoundError } from "../util/custom-error";

export async function main(event: { pathParameters: { id: string } }) {
  console.log(`Event: ${JSON.stringify(event)}`);
  try {
    const product = await productService.getProductById(
      event?.pathParameters?.id
    );
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(product),
    };
  } catch (error: unknown) {
    if (error instanceof BadRequestError) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify((error as BadRequestError).message),
      };
    }
    if (error instanceof NotFoundError) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify((error as NotFoundError).message),
      };
    }
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify((error as Error).message),
    };
  }
}
