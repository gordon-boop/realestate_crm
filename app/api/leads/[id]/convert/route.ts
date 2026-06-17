import { handleApiError, json, requireRole } from "@/lib/api";
import { isInternalAdmin } from "@/lib/access-control";
import { convertDbLeadToCase, getDbLeadById } from "@/lib/persistence";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const lead = await getDbLeadById(params.id);
    if (!lead) throw new Error("Lead not found");
    const assignment = user.role === "partner"
      ? { partnerId: user.partnerId }
      : {
          partnerId: lead.assignedPartnerId,
          advisorUserId: lead.assignedAdvisorUserId ?? (!lead.assignedPartnerId ? user.id : !isInternalAdmin(user) ? user.id : undefined)
        };
    if (!assignment.partnerId && !assignment.advisorUserId) throw new Error("Partner oder Kundenberater assignment required");
    if (user.role === "partner" && lead.assignedPartnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "admin" && !isInternalAdmin(user) && lead.assignedAdvisorUserId !== user.id) throw new Error("Forbidden");
    if (user.role === "partner" && !["CONTACTED", "PARTNER_CONTACT_PENDING"].includes(lead.status)) throw new Error("Lead must be marked as contacted before conversion");
    if (user.role === "admin" && !isInternalAdmin(user) && !["CONTACTED", "PARTNER_CONTACT_PENDING"].includes(lead.status)) throw new Error("Lead must be marked as contacted before conversion");

    const convertedCase = await convertDbLeadToCase(params.id, assignment, user.id, user.role);
    return json({ case: convertedCase }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
