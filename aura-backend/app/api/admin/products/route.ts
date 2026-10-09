import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { productInput, slugify } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await db.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }));
  } catch (e) { return handleError(e); }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = productInput.parse(await req.json());
    const base = slugify(data.name);
    const exists = await db.product.count({ where: { slug: base } });
    const product = await db.product.create({
      data: { ...data, slug: exists ? `${base}-${Date.now().toString(36)}` : base },
    });
    revalidatePath("/"); revalidatePath("/products");
    return ok(product, 201);
  } catch (e) { return handleError(e); }
}
