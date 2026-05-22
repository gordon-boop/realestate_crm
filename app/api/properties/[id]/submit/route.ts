import { canMutateProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId, updateDbPropertyStatus } from "@/lib/persistence";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canMutateProperty(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.customer.consentDataProcessing) throw new Error("Data processing consent required");
    if (caseView.property.leaseholdOrMonument || caseView.property.leasehold || caseView.property.monumentProtection) {
      throw new Error("Leasehold or monument protection is an exclusion criterion");
    }

    const property = await updateDbPropertyStatus(params.id, "SUBMITTED");
    await addDbActivity(params.id, user.id, "submitted", "Fall wurde zur Bewertung eingereicht.");
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
