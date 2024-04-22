import { v4 } from "uuid";
import { Product } from "../mock-data/data";
import { validateProduct } from "../util/validate-product";
import { validateId } from "../util/validate-id";

import * as AWS from "aws-sdk";
import { NotFoundError, ServerError } from "../util/custom-error";

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
    let products: Product[] | undefined = [];
    let stock: Stock[] | undefined = [];

    try {
      products = (await dynamodb.scan(productTableParams).promise()).Items as
        | Product[]
        | undefined;
      if (!!products && products.length !== 0) {
        stock = (await dynamodb.scan(stockTableParams).promise()).Items as
          | Stock[]
          | undefined;
      }
    } catch (error) {
      console.error("Error:", error);

      throw new ServerError("Error fetching products");
    }
    if (!products || products.length === 0) {
      console.error("Product database empty");
      throw new ServerError("Product database empty");
    }
    if (!stock || stock.length === 0) {
      console.error("Stock database empty");
      throw new ServerError("Stock database empty");
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
  },
  getProductById: async (id: string) => {
    validateId(id);
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
      throw new NotFoundError("Product not found");
    }

    const stock = (await dynamodb.get(stockTableParams).promise())
      .Item as Stock;
    console.log("stock", stock);
    if (!stock) {
      console.error("Stock not found");
      throw new NotFoundError("Stock not found");
    }
    console.log("received request, sending back product", { product, stock });
    return { ...product, count: stock.count };
  },
  createProduct: async (product: Product) => {
    validateProduct(product);
    console.log("creating product", { product });
    const productTableParams = {
      TableName: TableName.Product,
      Item: { ...product, id: v4() },
    };
    try {
      await dynamodb.put(productTableParams).promise();
      console.log("succesfully created product", { product });
      return product;
    } catch (error) {
      console.error("Error:", error);
      throw new ServerError("Error creating product");
    }
  },
};
