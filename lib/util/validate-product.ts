export const validateProduct = (
  product: { title?: any; description?: any; price?: any } | null
) => {
  if (!product) {
    throw new Error("No product provided");
  }
  if (!product.title || !product.description || !product.price) {
    throw new Error("Invalid product");
  }
  if (typeof product.price !== "number") {
    throw new Error("Price is not a number");
  }
  if (typeof product.title !== "string") {
    throw new Error("Title is not a string");
  }
  if (typeof product.description !== "string") {
    throw new Error("Description is not a string");
  }
  return null;
};
