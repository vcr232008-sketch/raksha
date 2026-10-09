import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in .env before seeding");
  await db.user.upsert({
    where: { email: email.toLowerCase() }, update: {},
    create: { name: "Aura Admin", email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
  });

  const cats = [
    { name: "Dresses", slug: "dresses", description: "Occasion and evening dresses" },
    { name: "Sarees", slug: "sarees", description: "Handcrafted sarees" },
    { name: "Co-ord Sets", slug: "co-ord-sets", description: "Tailored matching sets" },
  ];
  for (const c of cats) await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  const byslug = Object.fromEntries((await db.category.findMany()).map((c) => [c.slug, c.id]));

  const products = [
    { name: "Ivory Silk Evening Gown", slug: "ivory-silk-evening-gown", sku: "AB-DR-001", price: 18500, salePrice: 15900, cat: "dresses", featured: true, sizes: ["S","M","L"], colours: ["Ivory"] },
    { name: "Midnight Velvet Dress", slug: "midnight-velvet-dress", sku: "AB-DR-002", price: 14200, cat: "dresses", featured: false, sizes: ["S","M","L","XL"], colours: ["Navy","Black"] },
    { name: "Rose Gold Banarasi Saree", slug: "rose-gold-banarasi-saree", sku: "AB-SA-001", price: 22000, cat: "sarees", featured: true, sizes: ["Free"], colours: ["Rose Gold"] },
    { name: "Sage Linen Co-ord Set", slug: "sage-linen-co-ord-set", sku: "AB-CO-001", price: 8900, cat: "co-ord-sets", featured: false, sizes: ["S","M","L"], colours: ["Sage","Sand"] },
  ];
  for (const { cat, ...p } of products)
    await db.product.upsert({
      where: { slug: p.slug }, update: {},
      create: { ...p, description: `${p.name}: tailored in premium fabric by Aura Boutique.`, stock: 8, images: [], categoryId: byslug[cat] },
    });
  console.log("Seed complete");
}
main().finally(() => db.$disconnect());
