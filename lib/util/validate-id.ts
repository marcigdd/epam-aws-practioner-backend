import { validate } from "uuid";

export const validateId = (id: string | null) => {
  if (!id) {
    throw new Error("No id provided");
  }
  if (!validate(id)) {
    throw new Error("Invalid id");
  }
  return null;
};
