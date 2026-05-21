import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { getCaseByPropertyId } from "@/lib/store";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ offer: caseView.offer ?? null, offers: caseView.offers });
  } catch (err) {
    return handleApiError(err);
  }
}
