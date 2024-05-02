import { validateProduct } from "./validate-product";

describe("validateProduct", () => {
  it("should throw an error if product is not provided", () => {
    expect(() => validateProduct(null)).toThrow("No product provided");
  });
  it("should throw an invalid product error if price attribute is missing", () => {
    expect(() => validateProduct({ title: "123", description: "123" })).toThrow(
      "Invalid product"
    );
  });
  it("should throw an invalid product error if title attribute is missing", () => {
    expect(() => validateProduct({ description: "123", price: 123 })).toThrow(
      "Invalid product"
    );
  });
  it("should throw an invalid product error if description attribute is missing", () => {
    expect(() => validateProduct({ title: "123", price: 123 })).toThrow(
      "Invalid product"
    );
  });
  it("should return null if product is valid", () => {
    expect(
      validateProduct({ title: "123", description: "123", price: 123 })
    ).toBeNull();
  });
  it("should throw an Price is not a number error if price is not a number", () => {
    expect(() =>
      validateProduct({ title: "123", description: "123", price: "123" })
    ).toThrow("Price is not a number");
  });
  it("should throw an Title is not a string error if title is not a string", () => {
    expect(() =>
      validateProduct({ title: 123, description: "123", price: 123 })
    ).toThrow("Title is not a string");
  });
  it("should throw an Description is not a string error if description is not a string", () => {
    expect(() =>
      validateProduct({ title: "123", description: 123, price: 123 })
    ).toThrow("Description is not a string");
  });
});
