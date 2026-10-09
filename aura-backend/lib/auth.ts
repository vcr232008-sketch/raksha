import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { ApiError } from "./api-response";

const COOKIE = "aura_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(s);
};

export type Session = { userId: string; role: "ADMIN" | "STAFF" };

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { userId: payload.userId as string, role: payload.role as Session["role"] };
  } catch { return null; }
}

/** Call at the top of every admin route handler. */
export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new ApiError(401, "Authentication required");
  if (s.role !== "ADMIN") throw new ApiError(403, "Admin access required");
  return s;
}
