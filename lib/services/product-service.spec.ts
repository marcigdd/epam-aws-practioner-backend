//mock aws-sdk library
import { get } from "http";
import {
  mockProducts,
  mockStock,
  mockProductsWithCount,
} from "../mock-data/data";
const mockPromise = jest.fn();
import { productService } from "./product-service";

jest.mock("aws-sdk", () => {
  return {
    config: {
      update: jest.fn(),
    },
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        scan: jest.fn().mockReturnThis(),
        promise: mockPromise,
        put: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
      })),
    },
  };
});

describe("product-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getProducts", () => {
    it("should return a list of products with stock", async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: mockProducts })
        .mockResolvedValueOnce({ Items: mockStock });
      const result = await productService.getProducts();
      expect(result).toEqual(mockProductsWithCount);
    });
    it("should throw an error if the product table is empty", async () => {
      mockPromise.mockResolvedValueOnce({ Items: [] });
      await expect(productService.getProducts()).rejects.toThrow(
        "Product database empty"
      );
    });
    it("should throw an error if the stock table is empty", async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [mockProducts] })
        .mockResolvedValueOnce({ Items: [] });
      await expect(productService.getProducts()).rejects.toThrow(
        "Stock database empty"
      );
    });
    it("should throw an error if there is an error fetching products", async () => {
      mockPromise.mockRejectedValueOnce(new Error("Error"));
      await expect(productService.getProducts()).rejects.toThrow(
        "Error fetching products"
      );
    });
  });
  describe("createProduct", () => {
    it("should create a product", async () => {
      const product = mockProducts[0];
      mockPromise.mockResolvedValueOnce({});
      const result = await productService.createProduct(product);
      expect(result).toEqual(product);
    });
    it("should throw an error if there is an error creating a product", async () => {
      const product = mockProducts[0];
      mockPromise.mockRejectedValueOnce(new Error("Error"));
      await expect(productService.createProduct(product)).rejects.toThrow(
        "Error creating product"
      );
    });
  });
  describe("getProductById", () => {
    it("should return a product by id", async () => {
      const product = mockProducts[0];
      mockPromise
        .mockResolvedValueOnce({ Item: product })
        .mockResolvedValueOnce({ Item: mockStock[0] });
      const result = await productService.getProductById(product.id);
      expect(result).toEqual({ ...product, count: mockStock[0].count });
    });
    it("should throw an error if product is not found with id", async () => {
      const product = mockProducts[0];
      mockPromise.mockResolvedValueOnce({ Item: null });
      await expect(productService.getProductById(product.id)).rejects.toThrow(
        "Product not found"
      );
    });
    it("should throw an error if stock is not found with id", async () => {
      const product = mockProducts[0];
      mockPromise.mockResolvedValueOnce({ Item: product });
      mockPromise.mockResolvedValueOnce({ Item: null });
      await expect(productService.getProductById(product.id)).rejects.toThrow(
        "Stock not found"
      );
    });
  });
});
