import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, toJsonSnapshot, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const existing = await prisma.offer.findUnique({ where: { id: params.id } });
    const offer = existing;
    if (!offer) throw new Error("Offer not found");
    if (offer.status !== "approved" && offer.status !== "sent") throw new Error("Offer must be approved before sending");
    const updated = await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        currentVersion: { increment: 1 }
      }
    });
    await prisma.offerVersion.create({ data: { offerId: updated.id, version: updated.currentVersion, snapshotJson: toJsonSnapshot(updated), createdByUserId: user.id } });
    await updateDbPropertyStatus(updated.propertyId, "SENT");
    await addDbActivity(updated.propertyId, user.id, "offer_sent", "Angebot wurde als versendet markiert.");
    return json({ offer: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
