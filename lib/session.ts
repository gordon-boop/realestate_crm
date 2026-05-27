import { createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const sessionCookieName = process.env.AUTH_COOKIE_NAME || "mvp_session_user";

type SessionData = {
  userId: string;
};

const maxAgeSeconds = 60 * 60 * 8;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }
  return secret;
}

function getSessionKey(): Uint8Array {
  return new TextEncoder().encode(getSessionSecret());
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: maxAgeSeconds
  };
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSessionKey());

  cookies().set(sessionCookieName, token, cookieOptions());
}

export async function readSession(): Promise<SessionData | null> {
  const sessionKey = getSessionKey();
  const token = cookies().get(sessionCookieName)?.value;
  if (!token) return null;

  try {
    const result = await jwtVerify(token, sessionKey);
    return typeof result.payload.userId === "string" ? { userId: result.payload.userId } : null;
  } catch {
    return null;
  }
}

export function readSessionSync(): SessionData | null {
  const sessionSecret = getSessionSecret();
  const token = cookies().get(sessionCookieName)?.value;
  if (!token) return null;

  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) return null;

  const expectedSignature = createHmac("sha256", sessionSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as { alg?: unknown };
    if (header.alg !== "HS256") return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
      exp?: unknown;
      userId?: unknown;
    };
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) return null;
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  cookies().set(sessionCookieName, "", {
    ...cookieOptions(),
    maxAge: 0
  });
}
