import { handleApiError, json, requireRole } from "@/lib/api";
import { isInternalAdmin } from "@/lib/access-control";
import { getDbLeadById, updateDbLeadStatus } from "@/lib/persistence";
import { leadStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = leadStatusSchema.parse(await request.json());
    const existing = await getDbLeadById(params.id);
    const lead = existing;
    if (!lead) throw new Error("Lead not found");
    if (user.role === "partner" && lead.assignedPartnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "admin" && !isInternalAdmin(user) && lead.assignedAdvisorUserId !== user.id) throw new Error("Forbidden");
    if (user.role === "partner" && body.status !== "CONTACTED") throw new Error("Forbidden");
    if (body.status === "CONVERTED") throw new Error("Use convert endpoint for converted leads");

    return json({ lead: await updateDbLeadStatus(params.id, body.status) });
  } catch (err) {
    return handleApiError(err);
  }
}
