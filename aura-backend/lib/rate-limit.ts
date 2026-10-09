import "server-only";
import { ApiError } from "./api-response";

// In-memory limiter: fine for one server / local dev.
// On serverless (Vercel) swap for Upstash Ratelimit, since memory isn't shared.
const hits = new Map<string, number[]>();

export function rateLimit(req: Request, key: string, limit: number, windowMs: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) throw new ApiError(429, "Too many requests, please try again later");
  recent.push(now);
  hits.set(id, recent);
}
