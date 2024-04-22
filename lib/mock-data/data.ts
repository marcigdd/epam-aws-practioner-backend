export const mockProducts: Product[] = [
  {
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 24,
    title: "ProductOne",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductTitle",
  },
  {
    description: "Short Product Description2",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 23,
    title: "Product",
  },
  {
    description: "Short Product Description4",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 15,
    title: "ProductTest",
  },
  {
    description: "Short Product Descriptio1",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "Product2",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductName",
  },
];

export const mockStock: Stock[] = [
  {
    count: 24,
    product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
  },
  {
    count: 15,
    product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
  },
  {
    count: 23,
    product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
  },
  {
    count: 15,
    product_id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
  },
  {
    count: 23,
    product_id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
  },
  {
    count: 15,
    product_id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
  },
];

export const mockProductsWithCount: ProductWithCount[] = mockProducts.map(
  (product) => {
    const stockItem = mockStock.find((item) => {
      return item.product_id === product.id;
    });
    return {
      ...product,
      count: stockItem?.count,
    } as ProductWithCount;
  }
);

export type Stock = {
  product_id: string;
  count?: number;
};

export type Product = {
  description: string;
  id: string;
  price: number;
  title: string;
};

export type ProductWithCount = Product & { count?: number };
