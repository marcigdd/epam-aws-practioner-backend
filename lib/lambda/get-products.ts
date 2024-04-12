import { products } from "./mock-data/data";

export async function main() {
  console.log("received request, sending back products");
  return {
    products,
  };
}
