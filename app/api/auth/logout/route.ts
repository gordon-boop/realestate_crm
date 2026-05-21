import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export function POST(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
