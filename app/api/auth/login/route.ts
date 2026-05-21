import { NextResponse } from "next/server";
import { sessionCookieName, verifyPassword } from "@/lib/auth";
import { error, handleApiError } from "@/lib/api";
import { findUserByEmail } from "@/lib/store";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const user = findUserByEmail(String(body.email ?? ""));

    if (!user || !verifyPassword(String(body.password ?? ""), user.passwordHash)) {
      return error("Invalid credentials", 401);
    }

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, partnerId: user.partnerId },
      redirectTo: user.role === "admin" ? "/admin" : "/partner"
    });
    response.cookies.set(sessionCookieName, user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8
    });
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
