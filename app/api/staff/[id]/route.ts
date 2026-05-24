import { handleApiError, json, requireInternalRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { staffUpdateSchema } from "@/lib/validation";

function mapStaff(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  internalRole: string | null;
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
    const existing = await prisma.user.findFirst({ where: { id: params.id, role: "admin" } });
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
