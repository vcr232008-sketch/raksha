import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await db.subscriber.findMany({ orderBy: { subscribedAt: "desc" } }));
  } catch (e) { return handleError(e); }
}
