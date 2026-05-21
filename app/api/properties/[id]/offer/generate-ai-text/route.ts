import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { generateMockOfferText } from "@/lib/ai-service";
import { addActivity, getCaseByPropertyId, saveOfferVersion, updatePropertyStatus } from "@/lib/store";
import { nowIso } from "@/lib/id";

export function POST(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.offer) throw new Error("Offer required before AI text generation");

    const text = generateMockOfferText(caseView, caseView.offer);
    Object.assign(caseView.offer, {
      aiCustomerText: text.customerText,
      aiPartnerSummary: text.partnerSummary,
      aiInternalRationale: text.internalRationale,
      status: "review",
      currentVersion: caseView.offer.currentVersion + 1,
      updatedAt: nowIso()
    });
    saveOfferVersion(caseView.offer, user.id);
    updatePropertyStatus(params.id, "INTERNAL_REVIEW");
    addActivity(params.id, user.id, "ai_text_created", "Mock-KI hat Angebotsentwurf erstellt.");
    return json({ offer: caseView.offer });
  } catch (err) {
    return handleApiError(err);
  }
}
