import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { getDbCaseByPropertyId } from "@/lib/persistence";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ offer: caseView.offer ?? null, offers: caseView.offers });
  } catch (err) {
    return handleApiError(err);
  }
}
