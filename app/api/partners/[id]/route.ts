import { handleApiError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireRole("admin");
    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) throw new Error("Partner not found");
    return json({ partner });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireRole("admin");
    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) throw new Error("Partner not found");
    const body = await request.json();
    const updated = await prisma.partner.update({
      where: { id: params.id },
      data: {
        companyName: body.companyName ?? partner.companyName,
        contactName: body.contactName ?? partner.contactName,
        email: body.email ?? partner.email,
        phone: body.phone ?? partner.phone,
        address: body.address ?? partner.address,
        status: body.status ?? partner.status
      }
    });
    return json({ partner: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
