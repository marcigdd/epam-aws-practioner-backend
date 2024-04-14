import { products } from "./mock-data/data";

export async function main() {
  console.log("received request, sending back products");
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(products),
  };
}
