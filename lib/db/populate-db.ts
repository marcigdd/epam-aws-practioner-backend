import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Configure AWS SDK
AWS.config.update({
  region: "us-east-2",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Array of test products
//correct type would be Product[] without id

type ProductData = {
  title: string;
  description: string;
  price: number;
};

const products: ProductData[] = [
  {
    title: "Product 1",
    description: "Description 1",
    price: 100,
  },
  {
    title: "Product 2",
    description: "Description 2",
    price: 200,
  },
  {
    title: "Cat",
    description: "Meow",
    price: 200,
  },
  {
    title: "Dog",
    description: "Woof",
    price: 200,
  },
  {
    title: "Bird",
    description: "Tweet",
    price: 199,
  },
];

// Function to put a product in the products table
async function putProduct(product: ProductData) {
  const id = uuidv4();
  const params = {
    TableName: "Product",
    Item: {
      id,
      ...product,
    },
  };
  //access the id
  await dynamodb.put(params).promise();
  return id;
}

// Function to put a stock item in the stock table
async function putStock(productId: string, count: number) {
  const params = {
    TableName: "Stock",
    Item: {
      product_id: productId,
      count,
    },
  };

  await dynamodb.put(params).promise();
}

// Function to fill tables with test data
async function fillTables() {
  for (const product of products) {
    const productId = await putProduct(product);
    console.log({ productId: productId });
    await putStock(productId as unknown as string, 10);
  }
}

fillTables().catch(console.error);
