import { handleApiError, json, requireInternalRole, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { staffCreateSchema } from "@/lib/validation";

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

export async function GET(): Promise<Response> {
  try {
    requireRole("admin");
    const staff = await prisma.user.findMany({
      where: { role: "admin" },
      orderBy: [{ internalRole: "desc" }, { name: "asc" }]
    });
    return json({ staff: staff.map(mapStaff) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    requireInternalRole("super_admin");
    const body = staffCreateSchema.parse(await request.json());
    const staff = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: body.password,
        role: "admin",
        internalRole: body.internalRole
      }
    });
    return json({ staff: mapStaff(staff) }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
