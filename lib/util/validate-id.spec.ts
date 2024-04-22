import { validateId } from "./validate-id";

describe("validateId", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";
  it("should throw an error if id is not provided", () => {
    expect(() => validateId(null)).toThrow("No id provided");
  });
  it("should throw an error if id is invalid", () => {
    expect(() => validateId("123")).toThrow("Invalid id");
  });
  it("should return null if id is valid", () => {
    expect(validateId(uuid)).toBeNull();
  });
});
