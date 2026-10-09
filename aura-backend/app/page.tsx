import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function Home() {
  const [featured, latest, categories] = await Promise.all([
    db.product.findMany({ where: { active: true, featured: true }, take: 4, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ where: { active: true }, take: 4, orderBy: { createdAt: "desc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="bg-gradient-to-b from-[var(--stone)] to-[var(--ivory)]">
        <div className="mx-auto max-w-4xl px-5 py-28 md:py-40 text-center">
          <p className="text-xs uppercase tracking-[.4em] text-[var(--gold)] mb-6">Luxury fashion design</p>
          <h1 className="font-serif-display text-5xl md:text-7xl leading-tight">Crafted to make you<br />feel extraordinary</h1>
          <p className="mt-6 max-w-xl mx-auto opacity-70">Handcrafted dresses, sarees and tailored sets, designed in-house at Aura Boutique.</p>
          <Link href="/products" className="btn mt-10">Explore the collection</Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 grid gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`}
              className="border border-[var(--stone)] py-10 text-center font-serif-display text-2xl hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">
              {c.name}
            </Link>
          ))}
        </section>
      )}

      <Grid title="Featured" items={featured} />
      <Grid title="New arrivals" items={latest} />
    </>
  );
}

function Grid({ title, items }: { title: string; items: Parameters<typeof ProductCard>[0]["p"][] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h2 className="font-serif-display text-4xl text-center mb-10">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
        {items.map((p) => <ProductCard key={p.slug} p={p} />)}
      </div>
    </section>
  );
}
