import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api-response";
import { productQuery } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const q = productQuery.parse(Object.fromEntries(new URL(req.url).searchParams));
    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(q.q && { OR: [
        { name: { contains: q.q, mode: "insensitive" } },
        { description: { contains: q.q, mode: "insensitive" } },
      ] }),
      ...(q.category && { category: { slug: q.category } }),
      ...((q.minPrice != null || q.maxPrice != null) && {
        price: { gte: q.minPrice, lte: q.maxPrice },
      }),
      ...(q.size && { sizes: { has: q.size } }),
      ...(q.colour && { colours: { has: q.colour } }),
      ...(q.featured && { featured: q.featured === "true" }),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.sort === "price_asc" ? { price: "asc" } :
      q.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      db.product.findMany({ where, orderBy, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        include: { category: { select: { name: true, slug: true } } } }),
      db.product.count({ where }),
    ]);
    return ok({ items, total, page: q.page, pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize) });
  } catch (e) { return handleError(e); }
}
