import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api-response";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // accepts product id or slug
    const product = await db.product.findFirst({
      where: { active: true, OR: [{ id }, { slug: id }] },
      include: { category: true },
    });
    return product ? ok(product) : fail("Product not found", 404);
  } catch (e) { return handleError(e); }
}
