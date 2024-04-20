import { productService } from "../services/product-service";

export async function main(event: { pathParameters: { id: string } }) {
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
  } catch (error) {
    const isNoIdError = (error as Error)?.message === "No id provided";
    return {
      statusCode: isNoIdError ? 400 : 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify((error as Error).message),
    };
  }
}
