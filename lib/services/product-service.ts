import { Product } from "../mock-data/data";

import * as AWS from "aws-sdk";

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
    if (!id) {
      console.error("No id provided");
      throw new Error("No id provided");
    }
    const productTableParams = {
      TableName: TableName.Product,
      Key: {
        id,
      },
    };
    const stockTableParams = {
      TableName: TableName.Stock,
      Key: {
        product_id: id,
      },
    };
    console.log("productTableParams", productTableParams);
    const product = (await dynamodb.get(productTableParams).promise())
      .Item as Product;
    console.log("product", product);
    if (!product) {
      console.error("Product not found");
      throw new Error("Product not found");
    }

    const stock = (await dynamodb.get(stockTableParams).promise())
      .Item as Stock;
    console.log("stock", stock);
    if (!stock) {
      console.error("Stock not found");
      throw new Error("Stock not found");
    }
    console.log("received request, sending back product", { product, stock });
    return { ...product, count: stock.count };
  },
  createProduct: async (product: Product) => {
    if (!product) {
      console.error("No product provided");
      throw new Error("No product provided");
    }
    console.log("creating product", { product });
    const productTableParams = {
      TableName: TableName.Product,
      Item: product,
    };
    try {
      await dynamodb.put(productTableParams).promise();
      console.log("succesfully created product", { product });
      return product;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Error creating product");
    }
  },
};
