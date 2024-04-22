import { validate } from "uuid";
import { BadRequestError } from "./custom-error";

export const validateId = (id: string | null) => {
  if (!id) {
    throw new BadRequestError("No id provided");
  }
  if (!validate(id)) {
    throw new BadRequestError("Invalid id");
  }
  return null;
};
