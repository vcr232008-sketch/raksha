import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { inr } from "@/components/ProductCard";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.product.findFirst({ where: { slug, active: true }, include: { category: true } });
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 grid gap-10 md:grid-cols-2">
      <div className="grid gap-3">
        {p.images.length ? p.images.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={p.name} className="w-full" />
        )) : <div className="aspect-[3/4] bg-[var(--stone)] grid place-items-center font-serif-display text-6xl text-[var(--gold)]/60">A</div>}
      </div>
      <div className="md:sticky md:top-24 self-start">
        <Link href={`/products?category=${p.category.slug}`} className="text-xs uppercase tracking-[.3em] text-[var(--gold)]">{p.category.name}</Link>
        <h1 className="font-serif-display text-4xl md:text-5xl mt-2">{p.name}</h1>
        <p className="text-xl mt-3">
          {p.salePrice != null ? <><span className="text-[var(--gold)]">{inr(p.salePrice)}</span> <s className="opacity-50 text-base ml-2">{inr(p.price)}</s></> : inr(p.price)}
        </p>
        <p className="mt-6 leading-relaxed opacity-80 whitespace-pre-line">{p.description}</p>
        {p.sizes.length > 0 && <p className="mt-6 text-sm"><b className="uppercase tracking-widest text-xs">Sizes</b> &nbsp;{p.sizes.join(" · ")}</p>}
        {p.colours.length > 0 && <p className="mt-2 text-sm"><b className="uppercase tracking-widest text-xs">Colours</b> &nbsp;{p.colours.join(" · ")}</p>}
        <p className="mt-2 text-sm">{p.stock > 0 ? (p.stock <= 3 ? `Only ${p.stock} left` : "In stock") : "Currently sold out"}</p>
        <Link href={`/contact?subject=${encodeURIComponent(`Enquiry: ${p.name}`)}`} className="btn mt-8">Enquire about this piece</Link>
      </div>
    </div>
  );
}
