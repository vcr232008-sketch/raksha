import Link from "next/link";

type P = { slug: string; name: string; price: unknown; salePrice: unknown; images: string[]; stock: number };
export const inr = (v: unknown) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function ProductCard({ p }: { p: P }) {
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="aspect-[3/4] bg-[var(--stone)] overflow-hidden">
        {p.images[0]
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          : <div className="h-full w-full grid place-items-center font-serif-display text-4xl text-[var(--gold)]/60">A</div>}
      </div>
      <h3 className="mt-3 font-serif-display text-xl">{p.name}</h3>
      <p className="text-sm">
        {p.salePrice != null
          ? <><span className="text-[var(--gold)]">{inr(p.salePrice)}</span> <s className="opacity-50 ml-1">{inr(p.price)}</s></>
          : inr(p.price)}
        {p.stock === 0 && <span className="ml-2 text-xs uppercase tracking-wider opacity-60">Sold out</span>}
      </p>
    </Link>
  );
}
