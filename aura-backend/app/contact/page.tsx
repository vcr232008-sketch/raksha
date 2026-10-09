import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact | Aura Boutique" };

export default async function Contact({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-serif-display text-5xl text-center">Get in touch</h1>
      <p className="text-center opacity-70 mt-3 mb-10">Custom orders, styling advice or a question about a piece. We'd love to hear from you.</p>
      <ContactForm defaultSubject={subject ?? ""} />
    </div>
  );
}
