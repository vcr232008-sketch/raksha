import { describe, it, expect } from "vitest";
import { productInput, contactInput, slugify } from "../lib/validations";

const base = { name: "Silk Gown", description: "Nice", price: 1000, sku: "AB-1", categoryId: "c1" };

describe("validation", () => {
  it("accepts a valid product", () => expect(productInput.safeParse(base).success).toBe(true));
  it("rejects sale price >= price", () =>
    expect(productInput.safeParse({ ...base, salePrice: 1000 }).success).toBe(false));
  it("rejects negative price", () =>
    expect(productInput.safeParse({ ...base, price: -5 }).success).toBe(false));
  it("rejects short contact messages", () =>
    expect(contactInput.safeParse({ name: "Ann", email: "a@b.co", subject: "Hi", message: "short" }).success).toBe(false));
  it("slugifies names", () => expect(slugify("Rose Gold Saree!")).toBe("rose-gold-saree"));
});
