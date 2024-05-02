import { productService } from "../services/product-service";
import { Product } from "../mock-data/data";
import { BadRequestError } from "../util/custom-error";

export async function main(event: { body: string }) {
  try {
    console.log("event", event);
    const product = await productService.createProduct(
      JSON.parse(event.body) as Product
    );
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(product),
    };
  } catch (error) {
    if (error instanceof BadRequestError) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(error.message),
      };
    }
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(error),
    };
  }
}
