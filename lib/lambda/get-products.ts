import { Product, products } from "./mock-data/data";

export async function main() {
  console.log("received request, sending back products");
  // Simulate an asynchronous operation with a Promise and setTimeout
  const data: Product[] = await new Promise((resolve) =>
    setTimeout(() => resolve(products), 1000)
  );
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(data),
  };
}
