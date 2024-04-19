import { productService } from "./product-service";
import { Product, products } from "../mock-data/data";

describe("getProductById", () => {
  it("should return a product when given a valid id", async () => {
    const validId = "7567ec4b-b10c-48c5-9345-fc73c48a80aa";
    const product = products.find((product) => product.id === validId);
    const result = await productService.getProductById(validId);
    expect(result).toEqual({ product });
  });

  it("should throw an error when given an invalid id", async () => {
    const id = "invalid-id";
    try {
      await productService.getProductById(id);
    } catch (error) {
      expect(error).toEqual(new Error("Product not found"));
    }
  });

  it("should throw an error when given no id", async () => {
    try {
      await productService.getProductById("");
    } catch (error) {
      expect(error).toEqual(new Error("No id provided"));
    }
  });
});
