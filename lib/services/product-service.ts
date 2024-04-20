import { Product, products } from "../mock-data/data";

export const productService = {
  getProducts: async () => {
    // Simulate an asynchronous operation with a Promise and setTimeout
    //every 10 time throw error
    if (Math.floor(Math.random() * 10) === 0) {
      throw new Error("Random unexpected error");
    }
    const data: Product[] = await new Promise((resolve) =>
      setTimeout(() => resolve(products), 1000)
    );
    return data;
  },
  getProductById: async (id: string) => {
    // Simulate an asynchronous operation with a Promise and setTimeout
    const data: Product[] = await new Promise((resolve) =>
      setTimeout(() => resolve(products), 1000)
    );
    if (!id) {
      console.error("No id provided");
      throw new Error("No id provided");
    }
    console.log("received request, sending back product by id", { id });
    const product = data.find((product) => product.id === id);
    if (!product) {
      console.error("Product not found");
      throw new Error("Product not found");
    }
    return {
      product,
    };
  },
};
