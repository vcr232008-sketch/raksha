import { z } from "zod";

const money = z.coerce.number().positive().max(10_000_000);

export const productInput = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(1).max(5000),
  price: money,
  salePrice: money.nullable().optional(),
  sku: z.string().trim().min(2).max(50),
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string().url()).max(10).default([]),
  sizes: z.array(z.string().trim().min(1)).default([]),
  colours: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().min(1),
}).refine((p) => p.salePrice == null || p.salePrice < p.price, {
  message: "Sale price must be lower than price", path: ["salePrice"],
});
export const productUpdate = productInput.partial();

export const productQuery = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().optional(), // slug
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  size: z.string().optional(),
  colour: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(12),
});

export const categoryInput = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  image: z.string().url().optional(),
});

export const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,17}$/, "Invalid phone number").optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(), // honeypot: bots fill it, humans don't
});

export const newsletterInput = z.object({ email: z.string().trim().email().max(150) });
export const loginInput = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(200) });
export const enquiryUpdate = z.object({ status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]) });

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-");
