import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { productQuery } from "@/lib/validations";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Collections | Aura Boutique" };

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const raw = await searchParams;
  const parsed = productQuery.safeParse(Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== "")));
  const q = parsed.success ? parsed.data : productQuery.parse({});

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(q.q && { OR: [{ name: { contains: q.q, mode: "insensitive" } }, { description: { contains: q.q, mode: "insensitive" } }] }),
    ...(q.category && { category: { slug: q.category } }),
    ...((q.minPrice != null || q.maxPrice != null) && { price: { gte: q.minPrice, lte: q.maxPrice } }),
    ...(q.size && { sizes: { has: q.size } }),
    ...(q.colour && { colours: { has: q.colour } }),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    q.sort === "price_asc" ? { price: "asc" } : q.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

  const [items, total, categories] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / q.pageSize));
  const link = (page: number) => {
    const p = new URLSearchParams(Object.entries(raw).filter(([k, v]) => v && k !== "page"));
    p.set("page", String(page));
    return `/products?${p}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif-display text-5xl text-center mb-10">Collections</h1>

      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 mb-10" method="get">
        <input name="q" defaultValue={q.q} placeholder="Search" className="input lg:col-span-2" />
        <select name="category" defaultValue={q.category ?? ""} className="input">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="size" defaultValue={q.size ?? ""} className="input">
          <option value="">Any size</option>
          {["XS", "S", "M", "L", "XL", "Free"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="sort" defaultValue={q.sort} className="input">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button className="btn">Apply</button>
      </form>

      {items.length === 0 ? (
        <p className="text-center opacity-70 py-20">No pieces match your search. <Link href="/products" className="underline">Clear filters</Link></p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      {pages > 1 && (
        <nav className="flex justify-center gap-6 mt-14 text-sm uppercase tracking-widest">
          {q.page > 1 && <Link href={link(q.page - 1)}>← Prev</Link>}
          <span className="opacity-60">{q.page} / {pages}</span>
          {q.page < pages && <Link href={link(q.page + 1)}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
