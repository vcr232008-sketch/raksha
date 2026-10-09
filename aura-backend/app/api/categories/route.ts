import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    return ok(await db.category.findMany({ orderBy: { name: "asc" } }));
  } catch (e) { return handleError(e); }
}
