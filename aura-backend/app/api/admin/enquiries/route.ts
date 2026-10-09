import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status");
    const where = status && ["NEW", "IN_PROGRESS", "RESOLVED"].includes(status)
      ? { status: status as "NEW" | "IN_PROGRESS" | "RESOLVED" } : {};
    return ok(await db.enquiry.findMany({ where, orderBy: { createdAt: "desc" } }));
  } catch (e) { return handleError(e); }
}
