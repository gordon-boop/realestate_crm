import { isInternalAdmin } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { getDbLeadById, updateDbLead } from "@/lib/persistence";
import { leadUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const existing = await getDbLeadById(params.id);
    if (!existing) throw new Error("Lead not found");
    if (user.role === "partner" && existing.assignedPartnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "admin" && !isInternalAdmin(user) && existing.assignedAdvisorUserId !== user.id) throw new Error("Forbidden");
    if (user.role === "partner") throw new Error("Forbidden");

    const body = leadUpdateSchema.parse(await request.json());
    const lead = await updateDbLead(params.id, body, user.id);
    return json({ lead });
  } catch (err) {
    return handleApiError(err);
  }
}
