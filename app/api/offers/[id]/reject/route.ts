import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, toJsonSnapshot, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const existing = await prisma.offer.findUnique({ where: { id: params.id } });
    if (!existing) throw new Error("Offer not found");
    const body = await request.json().catch(() => ({}));
    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        currentVersion: { increment: 1 }
      }
    });
    await prisma.offerVersion.create({ data: { offerId: offer.id, version: offer.currentVersion, snapshotJson: toJsonSnapshot(offer), createdByUserId: user.id } });
    await updateDbPropertyStatus(offer.propertyId, "REJECTED");
    await addDbActivity(offer.propertyId, user.id, "offer_rejected", String(body.reason ?? "Angebot wurde abgelehnt."));
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
