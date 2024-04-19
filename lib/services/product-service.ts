import { Product, products } from "../mock-data/data";

import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Configure AWS SDK
AWS.config.update({
  region: "us-east-2",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

enum TableName {
  Product = "Product",
  Stock = "Stock",
}

type Stock = {
  product_id: string;
  count: number;
};

export const productService = {
  getProducts: async () => {
    const productTableParams = {
      TableName: TableName.Product,
    };
    const stockTableParams = {
      TableName: TableName.Stock,
    };

    try {
      const products = (await dynamodb.scan(productTableParams).promise())
        .Items as Product[];
      if (!products) {
        console.error("Product database empty");
        throw new Error("Product database empty");
      }
      const stock = (await dynamodb.scan(stockTableParams).promise())
        .Items as Stock[];
      if (!stock) {
        console.error("Stock database empty");
        throw new Error("Stock database empty");
      }
      const productList = products.map((product: Product) => {
        const stockItem = stock.find((item) => {
          return item.product_id === product.id;
        });
        return {
          ...product,
          count: stockItem?.count,
        };
      });
      console.log("received request, sending back products", { productList });
      return productList;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Error fetching products");
    }
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

productService.getProducts().catch(console.error);
