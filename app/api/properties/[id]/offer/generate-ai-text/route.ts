import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { generateMockOfferText } from "@/lib/ai-service";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.offer) throw new Error("Offer required before AI text generation");

    const text = generateMockOfferText(caseView, caseView.offer);
    const offer = await prisma.offer.update({
      where: { id: caseView.offer.id },
      data: {
        aiCustomerText: text.customerText,
        aiPartnerSummary: text.partnerSummary,
        aiInternalRationale: text.internalRationale,
        status: "review",
        currentVersion: { increment: 1 }
      }
    });
    await prisma.offerVersion.create({
      data: { offerId: offer.id, version: offer.currentVersion, snapshotJson: toJsonSnapshot(offer), createdByUserId: user.id }
    });
    await updateDbPropertyStatus(params.id, "INTERNAL_REVIEW");
    await addDbActivity(params.id, user.id, "ai_text_created", "Mock-KI hat Angebotsentwurf erstellt.");
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
