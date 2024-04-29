import { productService } from "../services/product-service";
import { ServerError } from "../util/custom-error";

export async function main() {
  console.log(`Event: ${JSON.stringify(event)}`);
  try {
    const products = await productService.getProducts();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(products),
    };
  } catch (error: unknown) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify((error as ServerError).message),
    };
  }
}
