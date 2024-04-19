//create unit test for get-products function
import { productService } from "./product-service";
import { Product, products } from "../mock-data/data";

describe("getProducts", () => {
  it("should return a list of products", async () => {
    jest.spyOn(global.Math, "random").mockReturnValue(1);
    const result = await productService.getProducts();
    expect(result).toEqual(products);
  });
  it("should throw an error when random error", async () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0);
    try {
      await productService.getProducts();
    } catch (error) {
      expect(error).toEqual(new Error("Random unexpected error"));
    }
  });
});
