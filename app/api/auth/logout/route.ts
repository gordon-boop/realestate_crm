import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export function POST(): NextResponse {
  const response = NextResponse.json({ ok: true, redirectTo: "/login" });
  clearSession();
  return response;
}
