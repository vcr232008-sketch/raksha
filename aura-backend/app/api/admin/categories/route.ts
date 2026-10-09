import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { categoryInput, slugify } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = categoryInput.parse(await req.json());
    const category = await db.category.create({ data: { ...data, slug: slugify(data.name) } });
    revalidatePath("/products");
    return ok(category, 201);
  } catch (e) { return handleError(e); }
}
