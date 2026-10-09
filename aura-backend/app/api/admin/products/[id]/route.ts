import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { productUpdate } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };
const refresh = () => { revalidatePath("/"); revalidatePath("/products"); };

// PATCH also handles stock/availability: { "stock": 4, "active": false }
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = productUpdate.parse(await req.json());
    const product = await db.product.update({ where: { id }, data });
    refresh();
    return ok(product);
  } catch (e) { return handleError(e); }
}

// ?hard=true deletes permanently; default just deactivates (keeps history safe)
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const hard = new URL(req.url).searchParams.get("hard") === "true";
    if (hard) await db.product.delete({ where: { id } });
    else await db.product.update({ where: { id }, data: { active: false } });
    refresh();
    return ok({ id, deleted: hard, deactivated: !hard });
  } catch (e) { return handleError(e); }
}
