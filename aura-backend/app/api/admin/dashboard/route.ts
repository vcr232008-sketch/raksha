import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const [totalProducts, activeProducts, lowStock, pendingEnquiries, subscribers, categories] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { active: true } }),
        db.product.count({ where: { active: true, stock: { lte: 3 } } }),
        db.enquiry.count({ where: { status: "NEW" } }),
        db.subscriber.count({ where: { active: true } }),
        db.category.count(),
      ]);
    return ok({ totalProducts, activeProducts, lowStock, pendingEnquiries, subscribers, categories });
  } catch (e) { return handleError(e); }
}
