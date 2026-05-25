import { handleApiError, json, requireRole } from "@/lib/api";
import { convertDbLeadToCase, getDbLeadById } from "@/lib/persistence";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const lead = await getDbLeadById(params.id);
    if (!lead) throw new Error("Lead not found");
    const partnerId = user.role === "partner" ? user.partnerId : lead.assignedPartnerId;
    if (!partnerId) throw new Error("Partner assignment required");
    if (user.role === "partner" && lead.assignedPartnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "partner" && lead.status !== "CONTACTED") throw new Error("Lead must be marked as contacted before conversion");

    const convertedCase = await convertDbLeadToCase(params.id, partnerId, user.id, user.role);
    return json({ case: convertedCase }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
