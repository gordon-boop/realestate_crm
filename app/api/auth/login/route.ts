import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { error, handleApiError } from "@/lib/api";
import { createSession } from "@/lib/session";
import { findUserByEmail, upsertRuntimeUser } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/domain";

export const dynamic = "force-dynamic";

const runtimeStoreEnabled = process.env.WK_ENABLE_RUNTIME_STORE === "true";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    let user = runtimeStoreEnabled ? findUserByEmail(email) : undefined;

    if (!user) {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: { partner: true }
      });

      if (dbUser && !dbUser.deletedAt) {
        const mappedUser = {
          id: dbUser.id,
          partnerId: dbUser.partnerId ?? undefined,
          name: dbUser.name,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          role: dbUser.role,
          internalRole: dbUser.internalRole ?? undefined,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString()
        } satisfies User;
        user = runtimeStoreEnabled ? upsertRuntimeUser(mappedUser) : mappedUser;
      }
    }

    if (user && runtimeStoreEnabled) {
      const dbUserById = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUserById?.deletedAt) {
        user = undefined;
      } else if (dbUserById) {
        const mappedUser = {
          id: dbUserById.id,
          partnerId: dbUserById.partnerId ?? undefined,
          name: dbUserById.name,
          email: dbUserById.email,
          passwordHash: dbUserById.passwordHash,
          role: dbUserById.role,
          internalRole: dbUserById.internalRole ?? undefined,
          createdAt: dbUserById.createdAt.toISOString(),
          updatedAt: dbUserById.updatedAt.toISOString()
        } satisfies User;
        user = upsertRuntimeUser(mappedUser);
      }
    }

    if (!user || !(await verifyPassword(String(body.password ?? ""), user.passwordHash))) {
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, internalRole: user.internalRole, partnerId: user.partnerId },
      redirectTo: user.role === "admin" ? "/admin" : "/partner"
    });
    await createSession(user.id, user);
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
