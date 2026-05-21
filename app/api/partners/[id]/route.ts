import { handleApiError, json, requireRole } from "@/lib/api";
import { store } from "@/lib/store";
import { nowIso } from "@/lib/id";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    requireRole("admin");
    const partner = store.partners.find((item) => item.id === params.id);
    if (!partner) throw new Error("Partner not found");
    return json({ partner });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireRole("admin");
    const partner = store.partners.find((item) => item.id === params.id);
    if (!partner) throw new Error("Partner not found");
    const body = await request.json();
    Object.assign(partner, {
      companyName: body.companyName ?? partner.companyName,
      contactName: body.contactName ?? partner.contactName,
      email: body.email ?? partner.email,
      phone: body.phone ?? partner.phone,
      address: body.address ?? partner.address,
      status: body.status ?? partner.status,
      updatedAt: nowIso()
    });
    return json({ partner });
  } catch (err) {
    return handleApiError(err);
  }
}
