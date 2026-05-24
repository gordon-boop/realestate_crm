import { NextResponse } from "next/server";
import type { User, UserRole } from "./domain.ts";
import { requireCurrentUser } from "./auth.ts";

export function json(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : "Unknown error";
  const status = message.includes("Authentication") ? 401 : message.includes("required") ? 403 : message.includes("not found") ? 404 : 400;
  return error(message, status);
}

export function requireRole(...roles: UserRole[]): User {
  const user = requireCurrentUser();
  if (!roles.includes(user.role)) {
    throw new Error(`${roles.join(" or ")} role required`);
  }

  return user;
}

export function requireInternalRole(...roles: Array<NonNullable<User["internalRole"]>>): User {
  const user = requireRole("admin");
  const internalRole = user.internalRole ?? "employee";
  if (!roles.includes(internalRole)) {
    throw new Error(`${roles.join(" or ")} internal role required`);
  }

  return user;
}
