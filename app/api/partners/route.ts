import { handleApiError, json, requireRole } from "@/lib/api";
import { getDbPartners } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<Response> {
  try {
    requireRole("admin");
    return json({ partners: await getDbPartners() });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    requireRole("admin");
    const body = await request.json();
    const partner = await prisma.partner.create({
      data: {
        companyName: String(body.companyName ?? ""),
        contactName: String(body.contactName ?? ""),
        email: String(body.email ?? ""),
        phone: body.phone ? String(body.phone) : undefined,
        address: body.address ? String(body.address) : undefined,
        status: "active"
      }
    });
    return json({ partner }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
