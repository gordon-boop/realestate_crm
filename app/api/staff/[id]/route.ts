import { handleApiError, json, requireInternalRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { staffUpdateSchema } from "@/lib/validation";

function mapStaff(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  internalRole: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    internalRole: user.internalRole ?? "employee",
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const currentUser = requireInternalRole("super_admin");
    const body = staffUpdateSchema.parse(await request.json());
    const existing = await prisma.user.findFirst({ where: { id: params.id, role: "admin", deletedAt: null } });
    if (!existing) throw new Error("Mitarbeiter not found");

    if (existing.id === currentUser.id && body.internalRole && body.internalRole !== "super_admin") {
      throw new Error("Super-Admin kann die eigene Super-Admin-Rolle nicht entfernen");
    }

    const staff = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existing.name,
        email: body.email ?? existing.email,
        passwordHash: body.password ?? existing.passwordHash,
        internalRole: body.internalRole ?? existing.internalRole ?? "employee"
      }
    });
    return json({ staff: mapStaff(staff) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const currentUser = requireInternalRole("super_admin");
    const existing = await prisma.user.findFirst({ where: { id: params.id, role: "admin", deletedAt: null } });
    if (!existing) throw new Error("Mitarbeiter not found");

    if (existing.id === currentUser.id) {
      throw new Error("Super-Admin kann den eigenen Benutzer nicht löschen");
    }

    if (existing.internalRole === "super_admin") {
      const superAdminCount = await prisma.user.count({
        where: { role: "admin", internalRole: "super_admin", deletedAt: null }
      });
      if (superAdminCount <= 1) {
        throw new Error("Der letzte Super-Admin kann nicht gelöscht werden");
      }
    }

    const deletedAt = new Date();
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        deletedAt,
        email: `deleted-${existing.id}-${existing.email}`,
        passwordHash: `deleted-${existing.id}`,
        name: `${existing.name} (gelöscht)`
      }
    });

    return json({ deleted: true, staffId: existing.id });
  } catch (err) {
    return handleApiError(err);
  }
}
