import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-24 bg-[var(--ink)] text-[var(--ivory)]">
      <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="font-serif-display text-3xl mb-2">Join the Aura circle</h3>
          <p className="text-sm opacity-70 mb-5">New collections and private previews, delivered occasionally.</p>
          <NewsletterForm />
        </div>
        <div className="md:text-right text-sm opacity-70">
          <p className="font-serif-display text-2xl tracking-[.25em] uppercase opacity-100 mb-2">Aura</p>
          <p>© {new Date().getFullYear()} Aura Boutique. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
