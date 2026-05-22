import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { store } from "@/lib/store";
import { leadAssignSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const body = leadAssignSchema.parse(await request.json());
    const lead = store.leads.find((item) => item.id === params.id);
    if (!lead) throw new Error("Lead not found");
    if (lead.status === "CONVERTED") throw new Error("Converted leads cannot be reassigned");

    const partner = store.partners.find((item) => item.id === body.partnerId && item.status === "active");
    if (!partner) throw new Error("Partner not found");

    const now = nowIso();
    lead.status = "ASSIGNED";
    lead.assignedPartnerId = partner.id;
    lead.assignedByUserId = user.id;
    lead.assignedAt = now;
    lead.updatedAt = now;

    return json({ lead });
  } catch (err) {
    return handleApiError(err);
  }
}
