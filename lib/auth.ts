import type { User } from "./domain.ts";
export { verifyPassword } from "./password.ts";
export { sessionCookieName } from "./session.ts";
import { readSessionSync } from "./session.ts";
import { findUserById } from "./store.ts";

export function getCurrentUser(): User | undefined {
  const session = readSessionSync();
  return session ? findUserById(session.userId) : undefined;
}

export function requireCurrentUser(): User {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
