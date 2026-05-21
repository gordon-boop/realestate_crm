import { cookies } from "next/headers";
import type { User } from "./domain.ts";
import { findUserById } from "./store.ts";

export const sessionCookieName = "mvp_session_user";

export function verifyPassword(plainText: string, passwordHash: string): boolean {
  return plainText === passwordHash;
}

export function getCurrentUser(): User | undefined {
  const cookieStore = cookies();
  const userId = cookieStore.get(sessionCookieName)?.value;
  return userId ? findUserById(userId) : undefined;
}

export function requireCurrentUser(): User {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
