import { BadRequestError } from "./custom-error";

export const validateProduct = (
  product: { title?: any; description?: any; price?: any } | null
) => {
  if (!product) {
    throw new BadRequestError("No product provided");
  }
  if (!product.title || !product.description || !product.price) {
    throw new BadRequestError("Invalid product");
  }
  if (typeof product.price !== "number") {
    throw new BadRequestError("Price is not a number");
  }
  if (typeof product.title !== "string") {
    throw new BadRequestError("Title is not a string");
  }
  if (typeof product.description !== "string") {
    throw new BadRequestError("Description is not a string");
  }
  return null;
};
