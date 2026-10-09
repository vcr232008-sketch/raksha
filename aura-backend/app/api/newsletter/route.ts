import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { newsletterInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    rateLimit(req, "newsletter", 5, 15 * 60_000);
    const { email } = newsletterInput.parse(await req.json());
    await db.subscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { active: true },
      create: { email: email.toLowerCase() },
    });
    return ok({ subscribed: true }, 201);
  } catch (e) { return handleError(e); }
}
