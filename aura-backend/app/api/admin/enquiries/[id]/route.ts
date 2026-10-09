import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { enquiryUpdate } from "@/lib/validations";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = enquiryUpdate.parse(await req.json());
    return ok(await db.enquiry.update({ where: { id }, data: { status } }));
  } catch (e) { return handleError(e); }
}
