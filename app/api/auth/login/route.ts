import { NextResponse } from "next/server";
import { sessionCookieName, verifyPassword } from "@/lib/auth";
import { error, handleApiError } from "@/lib/api";
import { findUserByEmail, upsertRuntimeUser } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/domain";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    let user = findUserByEmail(email);

    if (!user) {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: { partner: true }
      });

      if (dbUser) {
        user = upsertRuntimeUser({
          id: dbUser.id,
          partnerId: dbUser.partnerId ?? undefined,
          name: dbUser.name,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          role: dbUser.role,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString()
        } satisfies User);
      }
    }

    if (!user || !verifyPassword(String(body.password ?? ""), user.passwordHash)) {
      return error("E-Mail oder Passwort ist falsch.", 401);
    }

    if (user.role === "partner" && user.partnerId) {
      try {
        const partner = await prisma.partner.findUnique({ where: { id: user.partnerId } });
        if (partner && partner.status !== "active") {
          return error("Ihr Maklerzugang ist noch nicht freigeschaltet.", 403);
        }
      } catch {
        // Local mock sessions can run without a reachable database.
      }
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
