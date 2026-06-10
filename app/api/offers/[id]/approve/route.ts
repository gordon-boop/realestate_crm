import { handleApiError, json, requireRole } from "@/lib/api";
import { assertAcquisitionPrecheckAllowsOffer } from "@/lib/acquisition-precheck";
import { assertRatingAllowsOffer } from "@/lib/object-rating";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const existing = await prisma.offer.findUnique({ where: { id: params.id } });
    if (!existing) throw new Error("Offer not found");
    const caseView = await getDbCaseByPropertyId(existing.propertyId);
    if (!caseView) throw new Error("Property not found");
    assertAcquisitionPrecheckAllowsOffer(caseView);
    assertRatingAllowsOffer(caseView.objectRatings, caseView.property, existing.kind === "binding" ? "binding" : "indicative");
    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: "approved",
        approvedByUserId: user.id,
        approvedAt: new Date(),
        currentVersion: { increment: 1 }
      }
    });
    await prisma.offerVersion.create({ data: { offerId: offer.id, version: offer.currentVersion, snapshotJson: toJsonSnapshot(offer), createdByUserId: user.id } });
    await updateDbPropertyStatus(offer.propertyId, "APPROVED");
    await addDbActivity(offer.propertyId, user.id, "offer_approved", "Angebot wurde intern freigegeben.");
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
