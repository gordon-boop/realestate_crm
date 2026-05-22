import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { store } from "@/lib/store";
import { leadStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = leadStatusSchema.parse(await request.json());
    const lead = store.leads.find((item) => item.id === params.id);
    if (!lead) throw new Error("Lead not found");
    if (user.role === "partner" && lead.assignedPartnerId !== user.partnerId) throw new Error("Forbidden");
    if (body.status === "CONVERTED") throw new Error("Use convert endpoint for converted leads");

    lead.status = body.status;
    lead.updatedAt = nowIso();
    return json({ lead });
  } catch (err) {
    return handleApiError(err);
  }
}
