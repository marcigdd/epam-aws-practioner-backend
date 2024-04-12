import { products } from "./mock-data/data";

export async function main(event: { id: string }) {
  const id = event?.id;
  if (!id) {
    console.error("No id provided");
    throw new Error("No id provided");
  }
  console.log("received request, sending back product by id", { id });
  const product = products.find((product) => product.id === id);
  if (!product) {
    console.error("Product not found");
    throw new Error("Product not found");
  }
  return {
    product,
  };
}
