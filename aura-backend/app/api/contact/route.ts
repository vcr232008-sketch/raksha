import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { contactInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    rateLimit(req, "contact", 5, 15 * 60_000);
    const { website, ...data } = contactInput.parse(await req.json());
    if (website) return ok({ received: true }); // honeypot hit: pretend success, save nothing
    await db.enquiry.create({ data: { ...data, phone: data.phone || null } });
    await notifyOwner(data).catch((e) => console.error("Email failed", e));
    return ok({ received: true }, 201);
  } catch (e) { return handleError(e); }
}

// Optional: uses Resend's HTTP API when RESEND_API_KEY + OWNER_EMAIL are set.
async function notifyOwner(d: { name: string; email: string; subject: string; message: string }) {
  const key = process.env.RESEND_API_KEY, to = process.env.OWNER_EMAIL;
  if (!key || !to) return;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Aura Boutique <onboarding@resend.dev>",
      to, reply_to: d.email, subject: `New enquiry: ${d.subject}`,
      html: `<p><b>${esc(d.name)}</b> (${esc(d.email)})</p><p>${esc(d.message)}</p>`,
    }),
  });
}
