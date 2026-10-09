import Link from "next/link";

const links = [["Collections", "/products"], ["Contact", "/contact"]];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-[var(--ivory)]/90 backdrop-blur border-b border-[var(--stone)]">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif-display text-2xl tracking-[.25em] uppercase">Aura</Link>
        <nav className="flex gap-6 text-xs uppercase tracking-[.2em]">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[var(--gold)] transition-colors">{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
