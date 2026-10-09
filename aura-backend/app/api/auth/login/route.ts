import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api-response";
import { loginInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";

let dummyHash: Promise<string> | undefined;

export async function POST(req: Request) {
  try {
    rateLimit(req, "login", 5, 15 * 60_000);
    const { email, password } = loginInput.parse(await req.json());
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    // Compare against a dummy hash when the user doesn't exist, so timing doesn't leak which emails are valid
    const hash = user?.passwordHash ?? (await (dummyHash ??= hashPassword("not-a-real-password")));
    const valid = await verifyPassword(password, hash);
    if (!user || !valid) return fail("Invalid email or password", 401);
    await createSession({ userId: user.id, role: user.role });
    return ok({ name: user.name, role: user.role });
  } catch (e) { return handleError(e); }
}
