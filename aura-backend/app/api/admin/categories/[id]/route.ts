import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { categoryInput, slugify } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = categoryInput.partial().parse(await req.json());
    const category = await db.category.update({
      where: { id }, data: { ...data, ...(data.name && { slug: slugify(data.name) }) },
    });
    revalidatePath("/products");
    return ok(category);
  } catch (e) { return handleError(e); }
}

// Fails with 409 if products still use the category (onDelete: Restrict)
export async function DELETE(_: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.category.delete({ where: { id } });
    revalidatePath("/products");
    return ok({ id, deleted: true });
  } catch (e) { return handleError(e); }
}
