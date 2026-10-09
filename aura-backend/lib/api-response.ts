import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const fail = (message: string, status = 400, details?: unknown) =>
  NextResponse.json({ success: false, error: message, details }, { status });

export function handleError(e: unknown) {
  if (e instanceof ApiError) return fail(e.message, e.status);
  if (e instanceof ZodError) return fail("Validation failed", 422, e.flatten().fieldErrors);
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return fail("A record with that unique value already exists", 409);
    if (e.code === "P2025") return fail("Record not found", 404);
    if (e.code === "P2003") return fail("Record is referenced by other data", 409);
  }
  console.error(e); // log server-side only
  return fail("Something went wrong", 500);
}
